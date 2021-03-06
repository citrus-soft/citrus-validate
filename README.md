# citrusValidator

<p><b>Внимание! Документация и примеры устарели! Для использования смотрите основной пример в index.html или ждите обновления.</b></p>

<p>Валидатор CitrusValidator jQuery Plugin</p>



<h2>Пример использования citrusValidator</h2>


```js
$(function() {
  var form = new citrusValidator($("#signupForm1"));
});
```
html:
```html
<form id="signupForm1" method="post" action="">
    <div class="form-group">
        <label class="col-sm-4 control-label" for="firstname1">Телефон:<span class="red">*</span></label>
        <div class="col-sm-6 icon-container input-container">
            <input data-valid="phone required" type="text" class="form-control" name="phone" placeholder="99-99-99 или +7 (999) 999-99-99"/>
        </div>
    </div>
</form>
```
<p>У каждого поля через data-valid="" указывается правила валидации через пробел.</p>

<h2>Работа с плагином</h2>

<h3>Предустановленные правила валидации</h3>
<ul>
    <li><b>required</b> - обязательное поле</li>
    <li><b>important</b> - вызывает событие lockForm если поле не валидно и unlockForm если валидно</li>
    <li><b>phone</b> - Все телефоны России. Пр. +7 111 111 11 11 или 11-11-11</li>
    <li><b>phone_full</b> - Федеральные номера России. Пр. +7 111 111 11 11</li>
    <li><b>ajax</b> - post ajax запрос по пути data-ajax-url. Ответ строка с ошибкой</li>
    <li><b>email</b> - Пр. qwerty@mail.ru</li>
    <li><b>number</b> - число + проверяет max, min параметры у поля</li>
    <li><b>main_password</b> - поле для проверки confirm_password</li>
    <li><b>confirm_password</b> - должен соответвовать main_password</li>
    <li><b>url</b> - Пр. http://site.ru</li>
    <li><b>inn</b> - ИНН юр и физ лица</li>
    <li><b>inn_u</b> - ИНН юр лица</li>
    <li><b>inn_f</b> - ИНН физ лица</li>
    <li><b>ogrn</b> - ОГРН</li>
    <li><b>kpp</b> - КПП</li>
</ul>

<h3>Все глобальные события, сообщения и правила устанавливаются через прототип (citrusValidator.prototype).</h3>
<ul>
    <li><b>_getMessage(messageName, arParams)</b> -  возвращает сообщение messageName отоформатированное массивом arParams или все сообщения если messageName пустое </li>
    <li><b>_setMessage(messageName, messageText)</b> - Устанавливает сообщение</li>
    <li><b>_getRule(ruleName)</b> - Получает правило ruleName или все правила если ruleName не задано</li>
    <li><b>_setRule(ruleName)</b> - устанавливает правило ruleName</li>
    <li><b>_setRules(obRules)</b> - устанавливает несколько правил</li>
    <li><b>_getEvent(eventName)</b> - возвращает событие eventName или все события если eventName не задано</li>
    <li><b>_setEvent(eventName, fn)</b> - устанавливает событие</li>
    <li><b>_setEvents(obEvents)</b> - устанавливает несколько событий</li>
</ul>

<h3>Локальные через объект конструктора citrusValidator.</h3>
<ul>
    <li><b>getMessage(messageName, arParams)</b> -  возвращает сообщение messageName отоформатированное массивом arParams или все сообщения если messageName пустое </li>
    <li><b>setMessage(messageName, messageText)</b> - Устанавливает сообщение</li>
    <li><b>getRule(ruleName)</b> - Получает правило ruleName или все правила если ruleName не задано</li>
    <li><b>setRule(ruleName)</b> - устанавливает правило ruleName</li>
    <li><b>setRules(obRules)</b> - устанавливает несколько правил</li>
    <li><b>getEvent(eventName)</b> - возвращает событие eventName или все события если eventName не задано</li>
    <li><b>setEvent(eventName, fn)</b> - устанавливает событие</li>
    <li><b>setEvents(obEvents)</b> - устанавливает несколько событий</li>
    <li><b>callEvent(eventName, arg)</b> - вызывает событие и передает в него параметр</li>
</ul>

