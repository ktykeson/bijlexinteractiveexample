import React, { createContext, useContext, useState } from 'react';

const EquationsContext = createContext();

export const useEquations = () => useContext(EquationsContext);

export const EquationsProvider = ({ children }) => {
  const [equations, setEquations] = useState([]);

  return (
    <EquationsContext.Provider value={{ equations, setEquations }}>
      {children}
    </EquationsContext.Provider>
  );
};