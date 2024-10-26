INSERT INTO department (department_name)
VALUES ('Finance'),
       ('Executive'),
       ('Marketing'),
       ('Engineering'),
       ('QA'),
       ('IT');

INSERT INTO role (title, salary, department_id)
VALUES ('Accounting Manager', 90000, 1),
       ('CFO', 120000, 1),
       ('CEO', 150000, 2),
       ('Chief Sales Rep', 80000, 3),
       ('Sales Rep', 60000, 3),
       ('Lead Developer', 115000, 4),
       ('QA Tester', 40000, 5),
       ('Technical Support', 75000, 6);
       
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES  ('Miku', 'Hatsune', 3, null),
        ('Meiko', 'Crypton', 2, null),
        ('Kaito', 'Crypton', 1, 2),
        ('Luka', 'Megurine', 4, null),
        ('Rin', 'Kagamine', 5, 4),
        ('Len', 'Kagamine', 5, 4),
        ('Gakupo', 'GACKT', 6, null),
        ('Teto', 'Kasane', 7, 7),
        ('Neru', 'Akita', 7, 7),
        ('Haku', 'Yowane', 8, null);