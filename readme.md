Данное приложение запускает веб-сервер с подключением к базе данных MongoDB при помощи библиотеки Mongoose.
Для этого достаточно запустить скрипт командой npm start или yarn start.
При успешном подключении в консоли будут выведены сообщения:
"Database connection successful" и "Server running. Use our API on port: XXXXXX."
В случае возникновения ошибки, в консоли будет сообщение ошибки и процесс будет завершен.

REST API предназначен для работы с коллекцией контактов и поддерживает следующие рауты:

## **@ GET /api/contacts**

- возвращает массив всех контактов в json-формате со статусом 200

---

## **GET /api/contacts/:id**

- получает параметр id;
- если такой id есть, возвращает объект контакта в json-формате со статусом 200;
- если такого id нет, возвращает json с ключом {"message": "Not found"} и статусом 404;

---

## **@ POST /api/contacts**

- получает body в формате {name, email, phone, favorite} (все поля обязательны, кроме favorite);
- если в body нет каких-то обязательных полей, возвращает json с ключом {"message": "missing required name field"} и статусом 400;
- если с body все хорошо, добавляет уникальный идентификатор в объект контакта
  и возвращает его в виде {id, name, email, phone, favorite} и статусом 201;
- если поле favorite не было указано в body, то при сохранении в базу нового контакта, поле favorite создается автоматически со значением по умолчанию {false}.

---

## **@ DELETE /api/contacts/:id**

- получает параметр id;
- если такой id есть, возвращает json формата {"message": "contact deleted"} и статусом 200;
- если такого id нет, возвращает json с ключом {"message": "Not found" и статусом 404}

---

## **@ PUT /api/contacts/:id**

- получает параметр id;
- получает body в json-формате c обновлением любых полей {name, email, phone и favorite};
- если body нет, возвращает json с ключом {"message": "missing fields"} и статусом 400;
- при успешном результате запроса возвращает обновленный объект контакта и статусом 200. В противном случае, возвращает json с ключом "message": "Not found" и статусом 404

---

## **@ PATCH /api/contacts/:contactId/favorite**

- получает параметр contactId;
- получает body в json-формате c обновлением поля favorite;
- если body нет, возвращает json с ключом {"message": "missing field favorite"} и статусом 400;
- при успешном результате запроса возвращает обновленный объект контакта и статусом 200. В противном случае, возвращает json с ключом {"message": "Not found"} и статусом 404
