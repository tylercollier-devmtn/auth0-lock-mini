INSERT INTO users_auth0_demo (auth0_id, email) values ($1, $2)
RETURNING *;
