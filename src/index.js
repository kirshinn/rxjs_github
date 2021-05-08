import {EMPTY, fromEvent} from 'rxjs';
import {map, debounceTime, distinctUntilChanged, switchMap, mergeMap, tap, catchError, filter} from 'rxjs/operators';
import {ajax} from 'rxjs/ajax';

const url = 'https://api.github.com/search/users?q=';
const search = document.getElementById('search');
const result = document.getElementById('result');

// создаем стрим
const stream$ = fromEvent(search, 'input')
    .pipe(
        // получаем значение из стрима
        map(event => event.target.value),
        // делаем задержку в 1 секунду между считыванием символов из input
        debounceTime(1000),
        // проверяем делался ли запрос ранее, по выбранному значению
        distinctUntilChanged(),
        // после каждого запроса очищаем div со списком результатов поиска
        tap(() => result.innerHTML = ''),
        // проводим проверку и если значение пустая строку прекращаем выполнение стримма
        filter(value => value.trim()),
        // запускаем выполнение нового стрима для ajax запроса к github api
        switchMap(value => ajax.getJSON(url + value).pipe(
            // обрабатываем ошибку, если запрос завершился неудачно
            catchError(error => EMPTY)
        )),
        // получаем массив элементов items
        map(response => response.items),
        // преобразуем возвращаемые объекты, как отдельно возвращаемый  объект (результат)
        mergeMap(items => items)
    );
// подписываемся на стрим
stream$.subscribe( user => {
    // описываем html разметку
    const html = `
        <div class="card">
            <div class="card-image">
                <img src="${user.avatar_url}" />
                <span class="card-title">${user.login}</span>
            </div>
            <div class="card-action">
                <a href="${user.html_url}" target="_blank">Открыть github</a>
            </div>
        </div>
    `
    // вставляем в div разметку со списком полученных результатов
    result.insertAdjacentHTML('beforeend', html)
});
