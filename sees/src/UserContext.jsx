import React, { createContext, useState, useContext, useEffect } from 'react';
import { UserFactory } from './Factory/UserFactory';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userBalance, setUserBalance] = useState(() => {
    const savedBalance = localStorage.getItem('userBalance');
    return savedBalance ? parseFloat(savedBalance) : 20.00;
  });

  const [user, setUser] = useState(() => {
    const rawUser = {
      isLoggedIn: localStorage.getItem('isLoggedIn') === 'true',
      name: localStorage.getItem('userName') || '',
      email: localStorage.getItem('userEmail') || '',
      role: localStorage.getItem('userRole') || 'user',
    };
    return UserFactory(rawUser);
  });

  useEffect(() => {
    localStorage.setItem('userBalance', userBalance.toString());
  }, [userBalance]);

  const deductBalance = (amount) => {
    setUserBalance(prevBalance => {
      const newBalance = prevBalance - amount;
      return Math.max(newBalance, 0);
    });
  };

  const addBalance = (amount) => {
    setUserBalance(prevBalance => prevBalance + amount);
  };

  const login = (userData) => {
    const userWithLogin = {
      isLoggedIn: true,
      ...userData
    };
    setUser(UserFactory(userWithLogin));

    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userName', userData.name || '');
    localStorage.setItem('userEmail', userData.email || '');
    localStorage.setItem('userRole', userData.role || 'user');
  };

  const logout = () => {
    const defaultUser = {
      isLoggedIn: false,
      name: '',
      email: '',
      role: 'user'
    };
    setUser(UserFactory(defaultUser));

    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
  };

  return (
    <UserContext.Provider value={{
      userBalance,
      setUserBalance,
      deductBalance,
      addBalance,
      user,
      login,
      logout
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);