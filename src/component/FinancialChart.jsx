import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const FinancialChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={400}>
    <BarChart data={data}>
      <XAxis dataKey="month" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="income" fill="#82ca9d" />
      <Bar dataKey="expense" fill="#8884d8" />
    </BarChart>
  </ResponsiveContainer>
);

export default FinancialChart;
