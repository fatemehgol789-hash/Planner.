const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];

const storageKey = 'parvazDaily_v1';

let state = {
  journals: {},
  laws: [],
  wellness: [],
  expenses: [],
  books: [],
  plants: [],
  mood: '',
  lawTab: 'نکته درسی',
  wellTab: 'غذاها'
};

try {
  state = {
    ...state,
    ...JSON.parse(localStorage.getItem(storageKey) || '{}')
  };
} catch (e) {}

const fa = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric'
});

const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const toFa = n => Number(n || 0).toLocaleString('fa-IR');

function persist() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function toast(msg) {
  const el = $('#toast');
  if (!el) return;

  el.textContent = msg;
  el.classList.add('show');

  clearTimeout(toast.t);
  toast.t = setTimeout(() => el.classList.remove('show'), 2200);
}

function go(page) {
  $$('.page').forEach(p => p.classList.remove('active'));

  const target = $(`#page-${page}`);
  if (target) target.classList.add('active');

  $$('.nav-item').forEach(b => {
    b.classList.toggle('active', b.dataset.page === page);
  });

  const titles = {
    home: 'روزت بخیر ✨',
    journal: 'دفتر روزانه',
    law: 'درس‌های حقوقی',
    wellness: 'تغذیه و ورزش',
    expenses: 'هزینه‌ها',
    books: 'رمان‌ها و کتاب‌ها',
    plants: 'گل‌ها',
    done: 'یک روز دیگر، یک قدم جلوتر'
  };

  if ($('#pageTitle')) {
    $('#pageTitle').textContent = titles[page] || 'Parvaz Daily';
  }

  if (page === 'journal') loadJournal();
  if (page === 'law') renderLaws();
  if (page === 'wellness') renderWellness();
  if (page === 'expenses') renderExpenses();
  if (page === 'books') renderBooks();
  if (page === 'plants') renderPlants();

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

if ($('#todaySide')) {
  $('#todaySide').textContent = fa.format(new Date());
}

if ($('#todayHome')) {
  $('#todayHome').textContent = fa.format(new Date());
}

if ($('#journalDate')) {
  $('#journalDate').value = todayISO();
}

$$('[data-page]').forEach(b => {
  b.addEventListener('click', () => go(b.dataset.page));
});

$$('[data-go]').forEach(b => {
  b.addEventListener('click', () => go(b.dataset.go));
});

if ($('#themeBtn')) {
  $('#themeBtn').addEventListener('click', () => {
    document.body.classList.toggle('dark');

    toast(
      document.body.classList.contains('dark')
        ? 'تم شب فعال شد'
        : 'تم روشن فعال شد'
    );
  });
}

$$('.mood').forEach(b => {
  b.addEventListener('click', () => {
    state.mood = b.dataset.mood;
    persist();

    $$('.mood').forEach(x => {
      x.classList.toggle('selected', x === b);
    });

    if ($('#moodMessage')) {
      $('#moodMessage').textContent =
        `حال امروزت: ${state.mood}؛ همین که به خودت توجه می‌کنی ارزشمند است.`;
    }

    toast('حال امروزت ثبت شد');
  });
});

function loadJournal() {
  if (!$('#journalDate')) return;

  const date = $('#journalDate').value || todayISO();

  const item = state.journals[date] || {
    tasks: [],
    gratitude: '',
    note: ''
  };

  $('#taskList').innerHTML = '';

  item.tasks.forEach((t, i) => {
    const li = document.createElement('li');

    li.innerHTML = `
      <input type="checkbox" ${t.done ? 'checked' : ''} aria-label="انجام شد">
      <span class="${t.done ? 'checked' : ''}"></span>
      <button class="delete-btn" aria-label="حذف">×</button>
    `;

    $('span', li).textContent = t.text;

    $('input', li).addEventListener('change', e => {
      item.tasks[i].done = e.target.checked;
      state.journals[date] = item;
      persist();
      loadJournal();
    });

    $('.delete-btn', li).addEventListener('click', () => {
      item.tasks.splice(i, 1);
      state.journals[date] = item;
      persist();
      loadJournal();
    });

    $('#taskList').append(li);
  });

  $('#gratitude').value = item.gratitude || '';
  $('#journalNote').value = item.note || '';
}

if ($('#journalDate')) {
  $('#journalDate').addEventListener('change', loadJournal);
}

if ($('#addTask')) {
  $('#addTask').addEventListener('click', () => {
    const text = $('#taskInput').value.trim();

    if (!text) return toast('اول یک کار بنویس');

    const date = $('#journalDate').value || todayISO();

    const item = state.journals[date] || {
      tasks: [],
      gratitude: '',
      note: ''
    };

    item.tasks.push({ text, done: false });

    state.journals[date] = item;
    $('#taskInput').value = '';

    persist();
    loadJournal();
    toast('به فهرست امروز اضافه شد');
  });
}

if ($('#taskInput')) {
  $('#taskInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') $('#addTask').click();
  });
}

if ($('#saveJournal')) {
  $('#saveJournal').addEventListener('click', () => {
    const date = $('#journalDate').value || todayISO();
    const old = state.journals[date] || { tasks: [] };

    state.journals[date] = {
      tasks: old.tasks,
      gratitude: $('#gratitude').value,
      note: $('#journalNote').value
    };

    persist();

    $('#journalStatus').textContent = 'ذخیره شد ✓';
    toast('دفتر روزانه ذخیره شد');
  });
}

$$('[data-lawtab]').forEach(b => {
  b.addEventListener('click', () => {
    state.lawTab = b.dataset.lawtab;

    $$('[data-lawtab]').forEach(x => {
      x.classList.toggle('active', x === b);
    });

    renderLaws();
  });
});

if ($('#saveLaw')) {
  $('#saveLaw').addEventListener('click', () => {
    const title = $('#lawTitle').value.trim();
    const body = $('#lawBody').value.trim();

    if (!title || !body) {
      return toast('عنوان و یادداشت را وارد کن');
    }

    state.laws.unshift({
      id: Date.now(),
      title,
      body,
      category: $('#lawCategory').value,
      tab: state.lawTab,
      date: fa.format(new Date())
    });

    persist();

    $('#lawTitle').value = '';
    $('#lawBody').value = '';

    renderLaws();
    toast('یادداشت حقوقی اضافه شد');
  });
}

function itemCard(item, icon, meta, remove) {
  const el = document.createElement('article');
  el.className = 'saved-item';

  const symbol = document.createElement('div');
  symbol.className = 'item-symbol';
  symbol.textContent = icon;

  const content = document.createElement('div');
  content.style.flex = '1';

  const h = document.createElement('h4');
  h.textContent = item.title || 'بدون عنوان';

  const p = document.createElement('p');
  p.textContent = item.body || item.note || '';

  const m = document.createElement('div');
  m.className = 'meta';
  m.textContent = meta || '';

  content.append(h, p, m);

  const del = document.createElement('button');
  del.className = 'delete-btn';
  del.textContent = '×';
  del.title = 'حذف';

  del.addEventListener('click', () => {
    if (confirm('این مورد حذف شود؟')) remove();
  });

  el.append(symbol, content, del);

  return el;
}

function renderLaws() {
  const list = $('#lawList');
  list.innerHTML = '';

  const rows = state.laws.filter(x => x.tab === state.lawTab);

  if (!rows.length) {
    list.innerHTML =
      '<div class="muted">هنوز یادداشتی ثبت نشده؛ اولین نکته‌ات را اضافه کن.</div>';
    return;
  }

  rows.forEach(x => {
    list.append(
      itemCard(
        { title: x.title, body: x.body },
        '⚖',
        `${x.category} · ${x.date}`,
        () => {
          state.laws = state.laws.filter(y => y.id !== x.id);
          persist();
          renderLaws();
        }
      )
    );
  });
}

$$('[data-welltab]').forEach(b => {
  b.addEventListener('click', () => {
    state.wellTab = b.dataset.welltab;

    $$('[data-welltab]').forEach(x => {
      x.classList.toggle('active', x === b);
    });

    $('#wellFormTitle').textContent =
      state.wellTab === 'غذاها'
        ? 'ثبت وعده غذایی'
        : state.wellTab === 'ورزش'
          ? 'ثبت فعالیت ورزشی'
          : 'ثبت آب و مراقبت';

    renderWellness();
  });
});

if ($('#saveWell')) {
  $('#saveWell').addEventListener('click', () => {
    const title = $('#wellTitle').value.trim();
    const body = $('#wellBody').value.trim();

    if (!title) return toast('یک عنوان وارد کن');

    state.wellness.unshift({
      id: Date.now(),
      title,
      body,
      time: $('#wellTime').value,
      tab: state.wellTab,
      date: fa.format(new Date())
    });

    persist();

    $('#wellTitle').value = '';
    $('#wellBody').value = '';

    renderWellness();
    toast('ثبت شد');
  });
}

function renderWellness() {
  const list = $('#wellList');
  list.innerHTML = '';

  const rows = state.wellness.filter(x => x.tab === state.wellTab);

  if (!rows.length) {
    list.innerHTML = '<div class="muted">هنوز موردی ثبت نشده است.</div>';
    return;
  }

  rows.forEach(x => {
    list.append(
      itemCard(
        { title: x.title, body: x.body },
        state.wellTab === 'ورزش' ? '♧' : state.wellTab === 'غذاها' ? '♨' : '♡',
        `${x.time} · ${x.date}`,
        () => {
          state.wellness = state.wellness.filter(y => y.id !== x.id);
          persist();
          renderWellness();
        }
      )
    );
  });
}

if ($('#saveExpense')) {
  $('#saveExpense').addEventListener('click', () => {
    const title = $('#expenseTitle').value.trim();
    const amount = Number($('#expenseAmount').value);

    if (!title || !amount || amount < 0) {
      return toast('عنوان و مبلغ معتبر وارد کن');
    }

    state.expenses.unshift({
      id: Date.now(),
      title,
      amount,
      category: $('#expenseCategory').value,
      note: $('#expenseNote').value,
      date: fa.format(new Date())
    });

    persist();

    $('#expenseTitle').value = '';
    $('#expenseAmount').value = '';
    $('#expenseNote').value = '';

    renderExpenses();
    toast('هزینه ثبت شد');
  });
}

function renderExpenses() {
  const total = state.expenses.reduce((s, x) => s + x.amount, 0);

  $('#expenseTotal').textContent = toFa(total) + ' تومان';
  $('#expenseCount').textContent = toFa(state.expenses.length);

  const list = $('#expenseList');
  list.innerHTML = '';

  if (!state.expenses.length) {
    list.innerHTML = '<div class="muted">هنوز هزینه‌ای ثبت نکرده‌ای.</div>';
    return;
  }

  state.expenses.forEach(x => {
    const el = itemCard(
      {
        title: x.title,
        body: (x.note ? x.note + ' · ' : '') + toFa(x.amount) + ' تومان'
      },
      '＄',
      `${x.category} · ${x.date}`,
      () => {
        state.expenses = state.expenses.filter(y => y.id !== x.id);
        persist();
        renderExpenses();
      }
    );

    list.append(el);
  });
}

if ($('#saveBook')) {
  $('#saveBook').addEventListener('click', () => {
    const title = $('#bookTitle').value.trim();

    if (!title) return toast('نام کتاب را وارد کن');

    state.books.unshift({
      id: Date.now(),
      title,
      author: $('#bookAuthor').value,
      body: $('#bookNote').value,
      status: $('#bookStatus').value,
      date: fa.format(new Date())
    });

    persist();

    $('#bookTitle').value = '';
    $('#bookAuthor').value = '';
    $('#bookNote').value = '';

    renderBooks();
    toast('کتاب به فهرست اضافه شد');
  });
}

function renderBooks() {
  const list = $('#bookList');
  list.innerHTML = '';

  if (!state.books.length) {
    list.innerHTML = '<div class="muted">فهرست کتاب‌هایت اینجا ساخته می‌شود.</div>';
    return;
  }

  state.books.forEach(x => {
    list.append(
      itemCard(
        {
          title: x.title,
          body: (x.author ? x.author + ' — ' : '') + x.body
        },
        '▥',
        `${x.status} · ${x.date}`,
        () => {
          state.books = state.books.filter(y => y.id !== x.id);
          persist();
          renderBooks();
        }
      )
    );
  });
}

$$('[data-plant]').forEach(b => {
  b.addEventListener('click', () => {
    $('#plantTitle').value = b.dataset.plant;

    $$('[data-plant]').forEach(x => {
      x.classList.toggle('selected', x === b);
    });

    $('#plantNote').focus();
  });
});

if ($('#savePlant')) {
  $('#savePlant').addEventListener('click', () => {
    const title = $('#plantTitle').value.trim();
    const body = $('#plantNote').value.trim();

    if (!title || !body) {
      return toast('نام گیاه و یادداشت را بنویس');
    }

    state.plants.unshift({
      id: Date.now(),
      title,
      body,
      date: fa.format(new Date())
    });

    persist();

    $('#plantTitle').value = '';
    $('#plantNote').value = '';

    renderPlants();
    toast('یادداشت گل ثبت شد');
  });
}

function renderPlants() {
  const list = $('#plantList');
  list.innerHTML = '';

  if (!state.plants.length) {
    list.innerHTML =
      '<div class="muted">هنوز یادداشتی برای گل‌ها ثبت نشده است.</div>';
    return;
  }

  state.plants.forEach(x => {
    list.append(
      itemCard(
        { title: x.title, body: x.body },
        '❀',
        x.date,
        () => {
          state.plants = state.plants.filter(y => y.id !== x.id);
          persist();
          renderPlants();
        }
      )
    );
  });
}

if (state.mood) {
  const b = $(`.mood[data-mood="${state.mood}"]`);

  if (b) b.classList.add('selected');

  if ($('#moodMessage')) {
    $('#moodMessage').textContent = `حال امروزت: ${state.mood}`;
  }
}

loadJournal();
