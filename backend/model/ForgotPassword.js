const { DataTypes } = require("sequelize");
const { sequelize } = require('../config/db');   // <- apna sequelize instance import karo
const User = require("./signup");                // <- signup model import karo

const ForgotPassword = sequelize.define("ForgotPassword", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,   // auto-generate UUID
        allowNull: false,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.INTEGER,          // ⚠️ same type as signup.id (agar UUID hai to UUID karo)
        allowNull: false
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: "forgot_password_requests", // DB table ka naam
    timestamps: false                      // agar tum createdAt/updatedAt nahi chahte
});

// ✅ Association (Many-to-One: ek user ke multiple requests)
ForgotPassword.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(ForgotPassword, { foreignKey: "user_id" });

module.exports = ForgotPassword;
