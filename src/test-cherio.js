import cheerio from 'cheerio';

const $ = cheerio.load(`<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Курсы Hexlet</title>
</head>
<body>
    <img src="/assets/professions/nodejs.png" alt="Иконка профессии Node.js-программист" />
        <h3>
            <a href="/professions/nodejs">Node.js-программист</a>
        </h3>
</body>
</html>`);

$('img').each((i, el) => console.log($(el).attr('src')));
console.log($('img').attr('src'));
