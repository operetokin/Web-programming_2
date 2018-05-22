/*********************************
*   Data Service Module          *
*  (Data Source Functions)       *
*********************************
var fs = require("fs");
var employees = [];
var department = [];
var empCount=0;
*/

	const Sequelize = require('sequelize');

	var sequelize = new Sequelize('dauc2de8cqoilp', 'frwawlwfeobbbw', 'b51dacdd9f0dd8b06c52dcd23b42e9e1a23bb2aa1a128bfcdf8cfd61c7bd4f16', {
    host: 'ec2-107-21-224-61.compute-1.amazonaws.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: true
    }
});

// Define a "Employee" model

var Employee = sequelize.define('Employee', {
    employeeNum: {
        type: Sequelize.INTEGER,
        primaryKey: true, // use "project_id" as a primary key
        autoIncrement: true // automatically increment the value
    },
    firstName: Sequelize.STRING,
    last_name: Sequelize.STRING,
    email: Sequelize.STRING,
    SSN: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addresCity: Sequelize.STRING,
    addressState: Sequelize.STRING,
    addressPostal: Sequelize.STRING,
    maritalStatus: Sequelize.STRING,
    isManager: Sequelize.BOOLEAN,
    employeeManagerNum: Sequelize.INTEGER,
    status: Sequelize.STRING,
    department: Sequelize.INTEGER,
    hireDate: Sequelize.STRING
});

// Define a "Department" model

var Department = sequelize.define('Department', {
    departmentId: {
        type: Sequelize.INTEGER,
        primaryKey: true, // use "project_id" as a primary key
        autoIncrement: true // automatically increment the value
    },
    departmentName: Sequelize.STRING
});

// Module functions
module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        sequelize.sync().then(function () {
            sequelize.authenticate()
                .then(function () {
                    console.log('Connection has been established successfully.');
                    resolve();
                })
                .catch(function (err) {
                    console.log('Unable to connect to the database:', err);
                    reject("unable to sync the database");
                });
        });
    });
}

/*module.exports.initialize = function(){
    
    return new Promise(function(resolve,reject){
        try{
            fs.readFile('./data/employees.json', function(error, data){
                if(error) 
                throw error;
                employees = JSON.parse(data);
                empCount=employees.length;
            });
            fs.readFile('./data/departments.json', function(error,data){
                if(error) throw error;
                departments = JSON.parse(data);
            });
        }catch(ex){
            reject("Unable to read file!");
        }
        resolve("Reading Data Successful.");
    });
}*/

 /*   module.exports.getAllEmployees = function(){
        var EmpAll=[];
        return new Promise(function(resolve,reject){
            for (var i = 0; i < employees.length; i++) {
                EmpAll.push(employees[i]);
            }
            if (EmpAll.length == 0){
                reject("No Result Returned!!!");
            }
        resolve(EmpAll);
        })
    }*/

    module.exports.getAllEmployees = function () {

    let promise = new Promise(function (resolve, reject) {
        Employee.findAll().then((data) => {
            resolve(data);
        }).catch(() => {
            reject("no results returned");
        })
    });
    return promise;
}
    
   
/*module.exports.getEmployeesByStatus = function(status){
    var arryByStatus = [];
    return new Promise(function(resolve,reject){
        for(let i = 0; i < employees.length; i++){
            if(employees[i].status == status){
                arryByStatus.push(employees[i]);
            }
        }
        if (arryByStatus.length == 0){
            reject("No Result Returned!!!");
        }
        resolve(arryByStatus);
    });
}*/

module.exports.getEmployeesByStatus = (s) => {
    return new Promise(function (resolve, reject) {
        Employee.findAll({
            attributes: ['status'],
            where: {
                status: s
            }
        }).then(function (data) {
            console.log("All first names where id == 2");
            for (var i = 0; i < data.length; i++) {
                console.log(data[i].fName);
            }
            resolve(data);
        }).catch(() => {
            reject("no results returned");
        });
    });
}
    
  /*  module.exports.getEmployeesByDepartment = function(department){
        var EmpDep = [];
        return new Promise(function(resolve,reject){
            for(let i = 0; i < employees.length; i++){
                if(employees[i].department == department){
                    EmpDep.push(employees[i]);
                }
            }
            if(EmpDep.length == 0){
                reject("No Result");
            }
        resolve(EmpDep);
        });
    } */

    module.exports.getEmployeesByDepartment = (d) => {
    return new Promise(function (resolve, reject) {
        Employee.findAll({
            where: {
                department: d
            }
        }).then(function (data) {
            console.log("All employees where department == " + d);
            for (var i = 0; i < data.length; i++) {
                console.log(data[i]);
            }
            resolve(data);
        }).catch(() => {
            reject("no results returned");
        });
    });
}
    
   /* module.exports.getEmployeesByManager = function(manager) {
        var EmpMan = [];
    
        return new Promise(function(resolve,reject) {
            for (let i = 0; i < employees.length; i++) {
                if (employees[i].employeeManagerNum == manager) {
                    EmpMan.push(employees[i]);
                }
            }
            if (EmpMan.length == 0 ) {
                reject("No Result");
            }
        resolve(EmpMan);
        }); 
    } */
    
module.exports.getEmployeesByManager = (m) => {
    return new Promise(function (resolve, reject) {
        Employee.findAll({
            where: {
                employeeManagerNum: m
            }
        }).then(function (data) {
            resolve(data);
        }).catch(() => {
            reject("no results returned");
        });
    });
}

   /* module.exports.getEmployeeByNum = function(num) {
        return new Promise(function(resolve,reject){
            for(let j = 0; j < employees.length; j++){
                if(employees[j].employeeNum == num){
                    resolve(employees[j]);
                }
            }
        reject("No Result Returned!!!");
        });
    } */

    module.exports.getEmployeeByNum = (num) => {
    return new Promise(function (resolve, reject) {
        Employee.findAll({
            where: {
                employeeNum: num
            }
        }).then(function (data) {
            resolve(data[0]);
        }).catch(() => {
            reject("no results returned");
        });
    });
}

  /*  module.exports.getManagers = function() {
        var Managers = [];
        return new Promise(function(resolve,reject){
            if(employees.length == 0){
                reject("No Result Returned!!!");
            }else{
                for (var q = 0; q < employees.length; q++) {
                     if (employees[q].isManager == true) {
                        Managers.push(employees[q]);       
                     }
                }
                if (Managers.length == 0) {
                         reject("No Result Returned!!!");
                 }
            }
            resolve(Managers);
         });
    }*/

    module.exports.getManagers = () => {
    return new Promise(function (resolve, reject) {
        Employee.findAll({
            where: {
                isManager: true
            }
        }).then(function (data) {
            resolve(data);
        }).catch(() => {
            reject("no results returned");
        });
    });
}

   module.exports.getDepartments = () => {
    return new Promise(function (resolve, reject) {
        Department.findAll({
        }).then( function (data) {
            resolve(data);
        }).catch(() => {
            reject("no results returned");
        });
    });
}

 module.exports.addEmployee = (employeeData) => {
    return new Promise(function (resolve, reject) {
        employeeData.isManager = (employeeData.isManager) ? true : false;

        for (var prop in employeeData) {
            if (employeeData[prop] == "") {
                employeeData[prop] = null;
            }
        }
        Employee.create({
            employeeNum: employeeData.employeeNum,
            firstName: employeeData.firstName,
            last_name: employeeData.last_name,
            email: employeeData.email,
            SSN: employeeData.SSN,
            addressStreet: employeeData.addressStreet,
            addresCity: employeeData.addresCity,
            addressState: employeeData.addressState,
            addressPostal: employeeData.addressPostal,
            maritalStatus: employeeData.maritalStatus,
            isManager: employeeData.isManager,
            status: employeeData.status,
            department: employeeData.department,
            hireDate: employeeData.hireDate
        }).then(() => {
            resolve();
        }).catch(() => {
            reject("unable to create employee");
        });
    });
}

module.exports.updateEmployee = (employeeData) => {
    return new Promise(function (resolve, reject) {
        employeeData.isManager = (employeeData.isManager) ? true : false;

        for (var prop in employeeData) {
            if (employeeData[prop] == "") {
                employeeData[prop] = null;
            }
        }
        Employee.update({
            employeeNum: employeeData.employeeNum,
            firstName: employeeData.firstName,
            last_name: employeeData.last_name,
            email: employeeData.email,
            SSN: employeeData.SSN,
            addressStreet: employeeData.addressStreet,
            addresCity: employeeData.addresCity,
            addressState: employeeData.addressState,
            addressPostal: employeeData.addressPostal,
            maritalStatus: employeeData.maritalStatus,
            isManager: employeeData.isManager,
            status: employeeData.status,
            department: employeeData.department,
            hireDate: employeeData.hireDate
        }, {
                where: { employeeNum: employeeData.employeeNum }
            }).then(() => {
                resolve();
            }).catch(() => {
                reject("unable to create employee");
            });
    });
}


module.exports.deleteEmployeeByNum = (empNum) => {

    return new Promise((resolve, reject) => {
        Employee.destroy({
            where: { employeeNum: empNum } // only remove user with id == 3
        }).then( () => {
            resolve()
        }).catch( () => {
            reject();
        });

    });


}

module.exports.addDepartment = (departmentData) => {
    return new Promise(function (resolve, reject) {

        console.log("addDepartment called")
        for (var prop in departmentData) {
            console.log("departmentData[prop] == " + departmentData[prop]);
            if (departmentData[prop] == "") {
                departmentData[prop] = null;
            }
        }
        console.log(departmentData.create);
        Department.create({
            departmentId: departmentData.departmentId,
            departmentName: departmentData.departmentName
        }).then(() => {
            resolve();
        }).catch(() => {
            reject("unable to create department");
        });
    });
}

module.exports.updateDepartment = (departmentData) => {
    return new Promise(function (resolve, reject) {
        console.log("updateDepartment called w/ data:" + departmentData.departmentName);

        for (var prop in departmentData) {
            if (departmentData[prop] == "") {
                departmentData[prop] = null;
            }
        }

        console.log("CALLING departmentData.update");
        Department.update({
            departmentId: departmentData.departmentId,
            departmentName: departmentData.departmentName
        }, {
                where:
                { 
                    departmentId: departmentData.departmentId 
                }
            }).then(() => {
                console.log("updated, resolving");
                resolve();
            }).catch(() => {
                reject("unable to update department");
            });
    });
}

module.exports.getDepartmentById = (id) => {
    return new Promise(function (resolve, reject) {
        Department.findAll({
            where: {
                departmentId: id
            }
        }).then(function (data) {
            resolve(data[0]);
        }).catch(() => {
            reject("no results returned");
        });
    });
}



  

    
  /*  module.exports.getDepartments = function() {
        var Department = [];
        return new Promise(function(resolve,reject){
            if(employees.length == 0){
                reject("No Result Returned!!!");
            }else{
                for (var v = 0; v < departments.length; v++) {
                    Department.push(departments[v]);       
                }
                if (Department.length == 0) {
                    reject("No Result Return!!!");
                }
            }
        resolve(Department);
        });
    }*/

 

  /*  module.exports.addEmployee = (employeeData) => {
        employeeData.isManager = (employeeData.isManager) ? true : false;
        employeeData.employeeNum = ++empCount;
        return new Promise((resolve, reject) => {
            employees.push(employeeData);
            if (employees.length == 0) {
                reject();
            }
            resolve(employees);
        });
    } */

   

  /*  module.exports.updateEmployee = (employeeData) => {
        employeeData.isManager = (employeeData.isManager) ? true : false;
        return new Promise((resolve, reject) => {
            for (let i = 0; i < employees.length; i++) {
                if (employees[i].employeeNum == employeeData.employeeNum) {
                    employees.splice(employeeData.employeeNum - 1, 1, employeeData);
                }
            }
            if (employees.length == 0) {
                reject("No Result Returned!!!");
            }
            resolve(employees);
        });
    } */

    



