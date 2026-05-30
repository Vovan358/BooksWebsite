# Инструкция по локальному запуску BooksWebsite

## Frontend

### Требования

1. [Vite](https://vite.dev/)

### Шаги

1. Откройте командную консоль
2. Введите cd `<директория до BooksFrontend, включая папку BooksFrontend>`
3. Последовательно введите команды `npm install`, `npm run dev`

---

## Backend

### Требования

1. [Microsoft Visual Studio версии 2022 и выше](https://visualstudio.microsoft.com/ru/downloads/)
2. [.NET 9 и выше](https://dotnet.microsoft.com/en-us/download/dotnet/9.0)
3. [Docker Desktop и Windows Subsystem for Linux (WSL)](https://www.docker.com/products/docker-desktop/)

### Шаги

1. Откройте файл `"BooksBackend.sln"` с помощью Microsoft Visual Studio в папке BooksBackend
2. Создайте таблицу createdAt:
    1. Нажмите `"Вид -> Обозреватель объектов SQL Server"` 
    2. В панели слева выберите `"SQL Server -> (localdb...) -> Базы данных -> BookStoreDb"` (если её нет, сначала запустите сервер) 
    3. Нажмите ПКМ -> Создать запрос
    4. Скопируйте текст из файла `"BooksBackend/SQL_Queries/createdAtQuery.sql"`, открыв его при помощи блокнота и перенесите в окно запроса Visual Studio
    5. Слева сверху нажмите `"Выполнить"`. SQL-запрос должен выполниться.
3. Запустите сервер. 
4. Откройте файл `"docker-compose.yml"` в папке BooksBackend
5. Замените путь под строкой `"volumes"` на ваш действительный путь до файла prometheus.yml
6. Запустите командную строку в папке BooksBackend 
7. Введите в командной строке команду `"docker compose up"` и подождите

--- 

Готово.
