const sourceJson = `{
  "event": {
    "title": "Ночь в музее",
    "date": "15 ноября, 18:30",
    "place": "Музей космонавтики, проспект Мира, 111",
    "description": "Вечерняя программа с выставкой и экскурсиями",
    "meeting": "Сбор: 18:30. Начало: 19:00."
  },
  "services": [
    { "id": "guide", "title": "  Экскурсия с гидом  ", "price": 500 },
    { "id": "audio", "title": "Аудиогид", "price": 350 },
    { "id": "catalog", "title": "Каталог выставки", "price": 250 }
  ]
}`;

// Парсим JSON с защитой
let data = null;
try {
  data = JSON.parse(sourceJson);
} catch (e) {
  // Если поломанный JSON — покажем ошибку данных, форму спрячем
  const dataError = document.querySelector('#data-error');
  if (dataError) dataError.hidden = false;
  const form = document.querySelector('#service-form');
  if (form) form.hidden = true;
}

// Если данные успешно получены — инициализируем страницу
if (data && data.event) {
  // Заполним карточку события
  document.querySelector('#event-title').textContent = data.event.title;
  document.querySelector('#event-date').textContent = data.event.date;
  document.querySelector('#event-place').textContent = data.event.place;
  document.querySelector('#event-description').textContent = data.event.description;

  // Показ формы (по условию изначально hidden, показать если JSON корректен)
  const form = document.querySelector('#service-form');
  if (form) form.hidden = false;

  // Кнопка показать программу
  const programBtn = document.querySelector('#show-program');
  const programBox = document.querySelector('#program');
  if (programBtn && programBox) {
    programBtn.addEventListener('click', () => {
      programBox.hidden = false;
      programBox.innerHTML = data.event.meeting;
    });
  }

  // Обработчик формы выбора услуг
  const choiceError = document.querySelector('#choice-error');
  const resultBox = document.querySelector('#result');
  const jsonBox = document.querySelector('#report-json');

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const guideChecked = document.querySelector('#guide').checked;
    const audioChecked = document.querySelector('#audio').checked;
    const catalogChecked = document.querySelector('#catalog').checked;

    const report = buildReport(data.services, guideChecked, audioChecked, catalogChecked);

    // Пустой выбор — показать ошибку выбора
    if (report.count === 0) {
      if (choiceError) choiceError.hidden = false;
      if (resultBox) resultBox.hidden = true;
      if (jsonBox) jsonBox.hidden = true;
      return;
    }

    // Есть выбор — скрываем ошибку и показываем результаты
    if (choiceError) choiceError.hidden = false; // сначала явно скрывали, но по ТЗ: "Непустой выбор после ошибки — ошибка скрыта"
    // Исправим согласно ТЗ:
    if (choiceError) choiceError.hidden = true;

    if (resultBox) {
      const names = report.items.map((it) => it.title).join('<br>');
      resultBox.innerHTML = `Выбрано услуг: ${report.count}<br>Итого: ${report.total} руб.<br>${names}`;
      resultBox.hidden = false;
    }

    if (jsonBox) {
      // Строго: сначала stringify, затем проверить parse
      const jsonStr = JSON.stringify(report);
      try {
        JSON.parse(jsonStr); // проверка на валидность
        jsonBox.textContent = jsonStr;
        jsonBox.hidden = false;
      } catch (_) {
        // Вряд ли случится, но в случае ошибки спрячем блок
        jsonBox.hidden = true;
      }
    }
  });
}

// Функция расчета отчета
// Требования:
// - принимает services и 3 булевых
// - filter для отбора по id
// - map: деструктуризация одного уровня { title, price }, trim для title
// - reduce чтобы посчитать сумму
// - исходные услуги не меняются
function buildReport(services, guideChecked, audioChecked, catalogChecked) {
  const wanted = new Set([
    guideChecked ? 'guide' : null,
    audioChecked ? 'audio' : null,
    catalogChecked ? 'catalog' : null,
  ].filter(Boolean));

  const items = services
    .filter((s) => wanted.has(s.id))
    .map((s) => {
      const { title, price } = s; // одноуровневая деструктуризация
      return { title: String(title).trim(), price };
    });

  const total = items.reduce((sum, it) => sum + Number(it.price || 0), 0);

  return {
    count: items.length,
    total,
    items,
  };
}
