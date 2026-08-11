 export interface Task {
     id: number;
     title: string;
     description: string;
    assignedUserId: number;
    status: 'Pending' | 'Completed';
     priority: 'Low' | 'Medium' | 'High';
     dueDate: string | null;
     createdAt: string;
     updatedAt: string;
 }

 export interface CreateTask {
     title: string;
     description: string;
     assignedUserId: number;
     priority: 'Low' | 'Medium' | 'High';
     dueDate: string | null;
 }

export interface UpdateTask {
    status: string;
     title?: string;
     description?: string;
     assignedUserId?: number;
     priority?: string;
     dueDate?: string | null;
}

export interface PagedResult<T> {
    items: T[];
    total: number;
}
