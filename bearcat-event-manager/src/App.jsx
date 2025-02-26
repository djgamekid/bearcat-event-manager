import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/login';
import Admin from './pages/admin/admin';
import AdminViewEvents from './pages/admin/admin-view-events';
import CreateEvent from './pages/admin/admin-create-event';
import User from './pages/user/user';
import Tickets from './pages/user/user-tickets';
import TicketDetails from './pages/user/user-tickets-detail';
import ViewTickets from './pages/user/user-view-tickets';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<User />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
        <Route path='/admin-view-events' element={<AdminViewEvents />} />
        <Route path='/create-event' element={<CreateEvent />} />
        <Route path='/user-tickets' element={<Tickets />} />
        <Route path='/user-tickets/:id' element={<TicketDetails />} />
        <Route path='/user-view-tickets' element={<ViewTickets />} />
    
      </Routes>
    </Router>
  );
}

export default App;