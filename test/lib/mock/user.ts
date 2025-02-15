//mock/user.ts
export const expUser = {
  id: expect.any(Number),
  username: expect.any(String),
  email: expect.any(String),
  roles: expect.any(Array),
  createdAt: expect.any(Date),  
  updatedAt: expect.any(Date), 
  deletedAt: null,
};

export const userMock = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  roles: [{ name: 'USER' }],
  createdAt: new Date(), 
  updatedAt: new Date(),   
  deletedAt: null,
};


export const userListMock = [userMock, { ...userMock, id: 2, username: 'anotheruser' }];

export const queryMock = {
  page: 1,
};

export const paginatedResultMock = {
  data: userListMock,
  total: 2,
  size: 10,
  prev: false,
  next: false,
  currentPage: 1,
  totalPages: 1,
};

export const expPagMock = {
  data: expect.any(Array),
  currentPage: expect.any(Number),
  size: expect.any(Number),
  totalPages: expect.any(Number),
  total: expect.any(Number),
  next: expect.any(Boolean),
  prev: expect.any(Boolean),
};

export const paginateMock = {
  skip: 0,
  take: 10,
  orderBy: { createdAt: 'desc' },
};
