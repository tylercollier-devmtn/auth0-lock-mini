INSERT INTO users (auth0_id, email) values ($1, $2)
RETURNING *;
