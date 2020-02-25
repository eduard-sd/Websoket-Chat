require('dotenv').config();
let Sequelize  = require('sequelize');

const sequelize = new Sequelize(`chat`, `${process.env.DB_USER}`, `${process.env.DB_PASS}`, {
    dialect: 'mysql',
    host: `${process.env.DB_HOST}`,
    port: "3306",
    define: {
        timestamps: false,
        freezeTableName: true
    }
});

const Users = sequelize.define("Users",{
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    status: {
        type: Sequelize.BOOLEAN,
        allowNull: false
    }
});

export const Chat = sequelize.define("Chat",{
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    message: {
        type: Sequelize.STRING,
        unique: false,
        allowNull: false
    },
    time: {
        type: Sequelize.DATE,
        allowNull: false
    }
});

Chat.hasOne(Users, { foreignKey: 'id', foreignKeyConstraint: true });

sequelize.sync();

