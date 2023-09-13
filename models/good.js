const Sequelize = require('sequelize');

class Good extends Sequelize.Model{
    static initiate(sequelize){
        Good.init({
            
        },{
            sequelize,
            timestamps:true,
            underscored:false,
            paranoid:false,
            modelName:'Good',
            tableName:'good',
            charset:'utf8mb4',
            collate:'utf8mb4_general_ci'
        })
    }


    static associate(db){
    }
}

module.exports=Good;