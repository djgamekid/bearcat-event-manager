import { useEvents } from '../../context/eventContext';
import { useTickets } from '../../context/ticketContext';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function EventAnalytics() {
  const { events } = useEvents();
  const { tickets } = useTickets();

  // Calculate total analytics
  const analytics = events.reduce((acc, event) => {
    const eventTickets = tickets.filter(ticket => ticket.eventId === event.id);
    const checkedInTickets = eventTickets.filter(ticket => ticket.checkedIn);

    return {
      totalEvents: acc.totalEvents + 1,
      totalTickets: acc.totalTickets + (event.ticketsSold || 0),
      totalCheckedIn: acc.totalCheckedIn + checkedInTickets.length,
      totalRevenue: acc.totalRevenue + ((event.ticketsSold || 0) * event.price)
    };
  }, {
    totalEvents: 0,
    totalTickets: 0,
    totalCheckedIn: 0,
    totalRevenue: 0
  });

  // Calculate monthly revenue data
  const monthlyRevenue = events.reduce((acc, event) => {
    const date = new Date(event.date);
    const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
    acc[monthYear] = (acc[monthYear] || 0) + ((event.ticketsSold || 0) * event.price);
    return acc;
  }, {});

  // Calculate ticket sales by event
  const eventSales = events.map(event => ({
    title: event.title,
    sold: event.ticketsSold || 0,
    total: event.tickets,
    revenue: (event.ticketsSold || 0) * event.price
  }));

  // Chart data for revenue trend
  const revenueData = {
    labels: Object.keys(monthlyRevenue),
    datasets: [
      {
        label: 'Monthly Revenue',
        data: Object.values(monthlyRevenue),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  // Chart data for event sales
  const salesData = {
    labels: eventSales.map(event => event.title),
    datasets: [
      {
        label: 'Tickets Sold',
        data: eventSales.map(event => event.sold),
        backgroundColor: 'rgba(75, 192, 192, 0.5)'
      }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="stat bg-base-200 rounded-box">
          <div className="stat-title">Total Events</div>
          <div className="stat-value">{analytics.totalEvents}</div>
        </div>
        <div className="stat bg-base-200 rounded-box">
          <div className="stat-title">Tickets Sold</div>
          <div className="stat-value">{analytics.totalTickets}</div>
        </div>
        <div className="stat bg-base-200 rounded-box">
          <div className="stat-title">Checked In</div>
          <div className="stat-value">{analytics.totalCheckedIn}</div>
        </div>
        <div className="stat bg-base-200 rounded-box">
          <div className="stat-title">Total Revenue</div>
          <div className="stat-value">${analytics.totalRevenue.toFixed(2)}</div>
        </div>
      </div>

      {/* Revenue Trend Chart */}
      <div className="bg-base-200 p-4 rounded-box">
        <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
        <div className="h-64">
          <Line
            data={revenueData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Monthly Revenue'
                }
              }
            }}
          />
        </div>
      </div>

      {/* Event Sales Chart */}
      <div className="bg-base-200 p-4 rounded-box">
        <h3 className="text-lg font-semibold mb-4">Event Sales</h3>
        <div className="h-64">
          <Bar
            data={salesData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Tickets Sold by Event'
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default EventAnalytics; 