const { hash, compare } = require("bcryptjs");
const AppError = require("../utils/AppError");
const sqliteConnection = require("../database/sqlite");

class UsersController {
    
    // *Criar um novo registro de usuário dentro do banco de dados
    async create(request, response) {
        const { name, email, password } = request.body;

        const database = await sqliteConnection();
        const checkUserExists = await database.get("SELECT * FROM users WHERE email = (?)", [email]);
        const hashedPassword = await hash(password, 8);

        if (checkUserExists) {
            throw new AppError("Este email já está sendo utilizado");
        }

        await database.run("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [name, email, hashedPassword]);

        return response.status(201).json({ message: "Successfully registered!" });
    }

    // *Atualizar um registro de usuário já existente no banco de dados
    async update(request, response) {
        const { name, email, password, old_password } = request.body;
        const user_id = request.user.id;

        const database = await sqliteConnection();
        const user = await database.get("SELECT * FROM users WHERE id = (?)", [user_id]);
        
        // *Name and email
        if (!user) {
            throw new AppError("Usuário não encontrado");
        }

        const userWithUpdatedEmail = await database.get("SELECT * FROM users WHERE email = (?)", [email]);

        if (userWithUpdatedEmail && userWithUpdatedEmail.id !== user.id) {
            throw new AppError("Este email já está em uso");
        }

        user.name = name ?? user.name;
        user.email= email ?? user.email;

        // *Password
        if (password && old_password) {
            const checkOldPassword = await compare(old_password, user.password);

            if (!checkOldPassword) {
                throw new AppError("A senha antiga não confere");
            }

            user.password = await hash(password, 8);
        }

        if (password && !old_password) {
            throw new AppError("Você precisa informar a senha antiga para definir uma nova")
        }

        // *Send the changes to database
        await database.run(`
            UPDATE users SET
            name = ?,
            email = ?,
            password = ?,
            updated_at = DATETIME('now', 'localtime')
            WHERE id = ?`,
            [user.name, user.email, user.password, user_id]);

            return response.json();
    }
}

module.exports = UsersController;
