import inquirer from "inquirer";
import ManagementActions from "./ManagementActions.js";

import { connectToDb } from '../connection.js';

await connectToDb();


class Cli {
    exit: boolean= false;
    managementActions: ManagementActions;

    constructor() {
        this.managementActions= new ManagementActions();
    }

    performActions(): void {
        inquirer
        .prompt([
            {
                type: 'list',
                name: 'action',
                message: 'Please select an action',
                choices: [
                    'View all departments',
                    'View all roles',
                    'View all employees',
                    'View employees by manager',
                    'View employees by department',
                    'Add a department',
                    'Add a role',
                    'Add an employee',
                    'Update an employee role',
                    'Update an employee manager',
                    'View total budget by department',
                    'Exit',
                ],
            },
        ])
        .then(async(answers: any) => {
            switch (answers.action){
                case 'View all departments':
                    await this.getAllDepartments();
                    break;

                case 'View all roles':
                    await this.getAllRoles();
                    break;
                
                case 'View all employees':
                    await this.getAllEmployees();
                    break;

                case 'View employees by manager':
                    await this.getEmployeesByManagerID();
                    break;

                case 'View employees by department':
                    await this.getEmployeesByDepartment();
                    break;

                case 'Add a department':
                    await this.addDepartment();
                    break;

                case 'Add a role':
                    await this.addRole();
                    break;

                case 'Add an employee':
                    await this.addEmployee();
                    break;

                case 'Update an employee role':
                    await this.updateEmployeeRole();
                    break;

                case 'Update an employee manager':
                    await this.updateEmployeeManager();
                    break;

                case 'View total budget by department':
                    await this.viewBudgetByDepartment();
                    break;

                case 'Exit':
                    this.exit= true;
                    break;

                default:
                    console.log('No valid option selected');
            }

            if (!this.exit) {
                this.performActions();
            }

        });
    }

    async getAllDepartments(): Promise<void> {
        const department= await this.managementActions.getAllDepartments();
        if (department.length >0) {
            console.table(department);
        }
        else{
            console.log('No departments found. Please create a department.');

            const {addDepartment}= await inquirer.prompt({
                type: 'confirm',
                name: 'addDepartment',
                message: 'No departments found. Please create a department.'
            });

            if (addDepartment) {
                await this.addDepartment();
            }
        }
    }

    async getAllRoles(): Promise<void> {
        const role= await this.managementActions.getAllRoles();
        if (role.length >0) {
            console.table(role);
        }
        else{
            console.log('No roles found. Please create a role.');
            const {addRole}= await inquirer.prompt({
                type: 'confirm',
                name: 'addRole',
                message: 'No roles found. Please create a role.'
            });
            if (addRole) {
                await this.addRole();
            }
        }
    }

    async getAllEmployees(): Promise<void> {
        const employee= await this.managementActions.getAllEmployees();
        if (employee.length >0) {
            console.table(employee);
        }
        else{
            console.log('No employees found. Please add an employee.');
            const {addEmployee}= await inquirer.prompt({
                type: 'confirm',
                name: 'addEmployee',
                message: 'No employees found. Please add an employee.'
            });
            if (addEmployee) {
                await this.addEmployee();
            }
        }
    }

    async getEmployeesByManagerID(): Promise<void> {
        const {managerId}= await inquirer.prompt([
            {
                type: 'input',
                name: 'managerId',
                message: 'Please enter the manager ID:',
                validate: (input: string) => {
                    if (!isNaN(parseInt(input))) {
                        return true;
                    }
                    return 'Please enter an existing manager ID:';
                },
            },
        ]);

        const hasManager= await this.managementActions.getEmployeesByManagerID(parseInt(managerId));
        if (!hasManager) {
            console.log(`'${managerId}' is not a valid manager ID.`);
            const {getAllEmployees}= await inquirer.prompt({
                type: 'confirm',
                name: 'getAllEmployees',
                message: 'View all employees?',
            });
            
            if(getAllEmployees) {
                await this.getAllEmployees();
            }
        }
        else {
            const underlings= await this.managementActions.getEmployeesByManagerID(parseInt(managerId));
            if (underlings.length === 0) {
                console.log('This manager does not have anyone working under them.');
            }
            else {
                console.table(underlings);
            }
        }
    }

    async getEmployeesByDepartment(): Promise<void> {
        const {departmentId}= await inquirer.prompt([
            {
                type: 'input',
                name: 'departmentId',
                message: 'Please enter the department ID:',
                validate: (input: string) => {
                    if (!isNaN(parseInt(input))) {
                        return true;
                    }
                    return 'Please enter an existing department ID:';
                },
            },
        ]);

        const departmentEmployees= await this.managementActions.getEmployeesByDepartment(parseInt(departmentId));

        if (departmentEmployees.length ===0) {
            console.log('This department does not have any employees. :(')
        }
        else {
            console.table(departmentEmployees);
        }
    }

    async addDepartment(): Promise<void> {
        const {newDepartment} = await inquirer.prompt([
            {
                type: 'input',
                name: 'newDepartment',
                message: 'What is the name of the new department?',
                validate: (input: string) => input.trim() !== '' || 'Please enter a department name.'
            },
        ]);

        try {
            await this.managementActions.addDepartment(newDepartment);
            console.log(`The ${newDepartment} department has been successfully created!`);
        }
        catch (error) {
            console.log(error);
        }
    }

// Still need addRole, addEmployee, updateEmployeeRole, updateEmployeeManager
    async addRole(): Promise<void> {
        const {title, salary, departmentId} = await inquirer.prompt([
            {
                type: 'input',
                name: 'title',
                message: 'Please enter the title of the new role:',
                validate: (input: string) => input.trim() !== '' || 
                'Field may not be left blank. Please enter a valid title for the new role.',
            },
            
            {
                type: 'input',
                name: 'salary',
                message: 'Please enter the salary for the new role:',
                validate: (input: string) => {
                    const roleSalary= parseFloat(input);
                    if (isNaN(roleSalary) || roleSalary <= 0) {
                        return 'Please enter a number greater than zero. Pay your employees- in cash.';
                    }
                    else {
                        return true;
                    
                    }
                },
            },

            {
                type: 'input',
                name: 'departmentId',
                message: 'Please assign the new role to a department by entering the corresponding department ID:',
                validate: async (input: string) => {
                    const assignedDepartmentId = parseInt(input);
                    if (isNaN(assignedDepartmentId) || assignedDepartmentId <= 0) {
                        return 'Please enter a valid department ID.';
                    }

                    const extantDepartments= await this.managementActions.getAllDepartments();
                    const departmentExists= extantDepartments.some(department => department.id === assignedDepartmentId);

                    if (!departmentExists) {
                        console.log('That department does not exist. Please enter a valid department ID.')
                    }
                    
                       return true;
                    
                },
            },
        ]);

        await this.managementActions.addRole(title, parseFloat(salary), parseInt(departmentId));
        console.log(`The role ${title} has been added to department ${departmentId} with a salary of ${salary}.`);
    }

    async addEmployee(): Promise<void> {
        const {firstName, lastName, roleId, managerId}= await inquirer.prompt([
            {
                type: 'input',
                name: 'firstName',
                message: 'Please enter the first name of the new employee:',
                validate: (input: string) => input.trim() !== '' || 'Field cannot be left blank. Please enter a first name.',
            },

        {
            type: 'input',
                name: 'lastName',
                message: 'Please enter the last name of the new employee:',
                validate: (input: string) => input.trim() !== '' || 'Field cannot be left blank. Please enter a last name.',
        },

        {
            type: 'input',
            name: 'roleId',
            message: 'Please enter the employee\s new role ID:',
            validate: (input: string) => {
                if (isNaN(Number(input))) {
                    return 'Please enter a valid role ID';
                }
                return true;
            }
        },

        {        
            type: 'input',
            name: 'managerId',
            message: 'Please enter the ID of the new employee\'s manager, if applicable:',
            default: '',
            validate: (input: string) => {
                if (input === '' || !isNaN(Number(input))) {
                    return true;
                }
                return 'Please enter a valid manager ID number, or leave this field blank.'
            }
        },
    ]);

    let managerIdNew;

    if (managerId== '') {
        managerIdNew = null;
    }
    else {
        managerIdNew= managerId;
    }

    await this.managementActions.addEmployee(firstName, lastName, roleId, managerIdNew);
    console.log (`The new employee, ${firstName} ${lastName} has been added.`)
    }

    async updateEmployeeRole(): Promise<void> {
        const {employeeId, newRoleId}= await inquirer.prompt([
            {
                type: 'input',
                name: 'employeeId',
                message: 'Please enter the ID of the employee you would like to update.',
                validate: async (input:string) => {
                    const employeeIdValue= parseInt(input);
                    if (isNaN(employeeIdValue) || employeeIdValue <=0) {
                        return 'That answer is not valid. Please enter a valid employee ID.';
                    }

                    const extantEmployees= await this.managementActions.getAllEmployees();
                    const employeeExists= extantEmployees.some(employee => employee.id === employeeIdValue);

                    if(!employeeExists) {
                        console.log('Employee not found.')
                        return false;
                    }
                    return true;
                },
            },

            {
                type: 'input',
                name: 'newRoleId',
                message: 'Please enter the new Role ID for this employee:',
                validate: async (input: string) => {
                    const roleIdValue= parseInt(input);
                    if (isNaN(roleIdValue) || roleIdValue <= 0) {
                        return 'Please enter a valid role ID number.'
                    }

                    const extantRoles= await this.managementActions.getAllRoles();
                    const roleExists= extantRoles.some(role => role.id=== roleIdValue);

                    if (!roleExists) {
                        console.log('That role does not exist. Please enter a valid role ID.');
                    }
                    return true;
                },
            },
        ]);

        await this.managementActions.updateEmployeeRole(parseInt(employeeId), parseInt(newRoleId));
        console.log(`The employee's role was updated to role ID ${newRoleId}.`);
    }

    async updateEmployeeManager(): Promise<void> {
        const {employeeId, newManagerId} = await inquirer.prompt([
            {
                type: 'input',
                name: 'employeeId',
                message: 'Please enter the ID of the employee whose manager you wish to update.',
                validate: async (input:string) => {
                    const employeeIdValue= parseInt(input);
                    if (isNaN(employeeIdValue) || employeeIdValue <= 0) {
                        return 'Please enter a valid employee ID number.';
                    }

                    const extantEmployees= await this.managementActions.getAllEmployees();
                    const employeeExists= extantEmployees.some(employee => employee.id === employeeIdValue);

                    if(!employeeExists) {
                        console.log('Employee not found.')
                        return false;
                    }
                    return true;

                },
            },

            {
                type: 'input',
                name: 'newManagerId',
                message: 'Please enter the ID of the employee\s new manager:',
                default: '',
                validate: async (input: string) => {
                    if (input === '') {
                        return true;
                    }

                    const managerIdValue= parseInt(input);
                    if (isNaN(managerIdValue) || managerIdValue <= 0) {
                        return 'The value you have entered is invalid. Please enter a valid manager ID or leave the field blank.';
                    }

                    const extantEmployees= await this.managementActions.getAllEmployees();
                    const managerExists= extantEmployees.some(employee => employee.id === managerIdValue);
                    if (!managerExists) {
                        return 'That manager does not exist. Please enter the ID of an existing employee.';
                    }

                    return true;
                },
            },
        ]);

        await this.managementActions.updateEmployeeManager(parseInt(employeeId), newManagerId);
        console.log(`The employee\s manager has been updated to ${newManagerId}.`);

    }

    async viewBudgetByDepartment(): Promise<void> {
       const {departmentId}= await inquirer.prompt([
        {
            type: 'input',
            name: 'departmentId',
            message: 'Please enter the ID of the department whose budget you wish to view:',
            validate: (input: string) => {
                if (!isNaN(parseInt(input))) {
                    return true;
                }
                return 'Please enter an existing department ID.';
            },
        },
       ]);

       const departmentBudget= await this.managementActions.viewBudgetByDepartment(parseInt(departmentId));


       if (departmentBudget) {
        console.log(`The total budget for this department is ${departmentBudget}.`);
       }
       else {
        console.log(`No department found with this ID.`)
       }
    }

    startCli(): void{
        this.performActions();
    }
}

export default Cli;