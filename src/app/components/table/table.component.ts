import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Employee } from '../../interfaces/employee.interface';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class TableComponent implements OnInit {
  employees: Employee[] = [
    {
      id: '124 - 08',
      name: 'John Adegoke',
      role: 'Zonal Pastor',
      status: 'Active',
      imageUrl: 'assets/images/avatar1.jpg'
    },
    {
      id: '124 - 08',
      name: 'Jane Adesanya',
      role: 'Worker',
      status: 'On leave',
      imageUrl: 'assets/images/avatar2.jpg'
    },
    // Add more mock data as needed
  ];

  constructor() { }

  ngOnInit(): void { }
}
