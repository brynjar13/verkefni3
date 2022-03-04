## Verkefni 3

# Stjórnanda upplýsingar

-`Notendanafn`: admin

-`Lykilorð`: 123

# Nokkur dæmi um vefþjónustu köll með curl

GET /events: curl https://vef-2022-verkefni3.herokuapp.com/event

GET /events/:id: curl https://vef-2022-verkefni3.herokuapp.com/events/1

---

POST /user/register: curl.exe -X POST https://vef-2022-verkefni3.herokuapp.com/user/register -H "Content-type:application/json" -d '>>{\"name\":\"siggi\", \"username\":\"siggi100\",\"password\":\"siggierbestur\"}'

> {"result":{"id":3,"name":"siggi"}}

---

POST /user/login: curl.exe -X POST https://vef-2022-verkefni3.herokuapp.com/user/login -H "Content-type:application/json" -d '{\"username\":\"siggi100\",\"password\":\"siggierbestur\"}'

> {"token": "eitthvað token"}

---

PATCH /events/:id: curl -X curl.exe -X PATCH https://vef-2022-verkefni3.herokuapp.com/events/1 -H 'Content-Type: application/json' -H 'Accept: application/json' -H "Authorization: Bearer ${token}" -d '{\"name\":\"fundur100\",\"description\":\"Funnnnddddduuuuurrr\"}'

> {"result":{"success":true,"item":{"id":1,"userid":1,"name":"fundur100","slug":"fundur100","description":"Funnnnddddduuuuurrr","created":"2022-03-04T17:35:50.783Z","updated":"2022-03-04T17:54:54.515Z"}},"msg":"Viðburður uppfærður"}

---

DELETE /events/:id/register curl.exe -i -X DELETE https://vef-2022-verkefni3.herokuapp.com/events/1/register -H "accept: application/json" -H "Authorization: Bearer ${token}"
