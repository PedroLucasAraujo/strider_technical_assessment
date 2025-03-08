import { User } from "../@types/index";

export const users: User[] = [
  {
    id: "1",
    username: "johndoe",
    joinedAt: "2023-01-15T00:00:00Z",
    followers: ["2", "3"],
    following: ["2"],
    postCount: 5,
  },
  {
    id: "2",
    username: "janedoe",
    joinedAt: "2023-02-20T00:00:00Z",
    followers: ["1"],
    following: ["1", "3"],
    postCount: 3,
  },
  {
    id: "3",
    username: "bobsmith",
    joinedAt: "2023-03-10T00:00:00Z",
    followers: ["2"],
    following: ["1"],
    postCount: 2,
  },
];

export const getUserById = (id: string): User | undefined => {
  return users.find((user) => user.id === id);
};

export const getCurrentUser = (): User => {
  return users[0];
};

export const getUserByUsername = (username: string): User | null => {
  const user = users.find((user) => user.username === username);
  return user || null;
};
