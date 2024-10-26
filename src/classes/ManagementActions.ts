import pkg from 'pg';
const {Pool} = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool= new Pool({
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
});

class ManagementActions {
    async getAllDepartments() {
        const res= await pool.query('SELECT * FROM department');
        return res.rows;
    }

    async getAllRoles() {
        const res= await pool.query('SELECT * FROM role')
        return res.rows;
    }

    async getAllEmployees() {
        const res= await pool.query('SELECT * FROM employee');
        return res.rows;
    }

    async getEmployeesByManagerID(managerId: number) {
        const res= await pool.query('SELECT * FROM employee WHERE manager_id= $1', [managerId])
        return res.rows;
    }

    async getEmployeesByDepartment(departmentId: number) {
        const res= await pool.query('SELECT * FROM employee JOIN role ON employee.role_id = role.id WHERE department_id= $1', [departmentId])
        return res.rows;
    }

    async addDepartment(departmentName: string){
        const res= await pool.query(
            'INSERT INTO department (department_name) VALUES ($1) RETURNING *',
            [departmentName]
        );
        return res.rows[0];
    }

    async addRole(title: string, salary: number, departmentId: number){
        const res= await pool.query(
            'INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3) RETURNING *',
            [title, salary, departmentId]
        );
        return res.rows[0];
    }

    async addEmployee(firstName: string, lastName: string, role_id: number, manager_id: number | null) {
        const res= await pool.query(
            'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4) RETURNING *',
            [firstName, lastName, role_id, manager_id]
        );
        return res.rows[0];
    }

    async updateEmployeeRole(employeeId: number, newRoleId: number) {
        const res= await pool.query('UPDATE employee SET role_id= $1 WHERE id= $2 RETURNING *', 
            [newRoleId, employeeId]
        );
        return res.rows[0];
    }

    async updateEmployeeManager(employeeId: number, newManagerId: number) {
        const res= await pool.query('UPDATE employee SET manager_id= $1 WHERE id= $2 RETURNING *',
            [newManagerId, employeeId]
        );
        return res.rows[0];
    }

    async viewBudgetByDepartment(departmentId: number) {
        const query= 
        `SELECT SUM(r.salary) 
        AS totalbudget 
        FROM employee e 
        JOIN role r
        ON e.role_id= r.id
        WHERE r.department_id= $1`;

        const res= await pool.query(query, [departmentId]);
        return res.rows[0].totalbudget;
    
    }
}

export default ManagementActions;