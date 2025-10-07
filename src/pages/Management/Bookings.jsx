import React, { useState, useEffect } from 'react';

const Bookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setBookings([
                {
                    id: 1,
                    customer: 'John Doe',
                    batteryType: 'Lithium-Ion',
                    date: '2024-06-10',
                    status: 'Confirmed',
                },
                {
                    id: 2,
                    customer: 'Jane Smith',
                    batteryType: 'Lead-Acid',
                    date: '2024-06-12',
                    status: 'Pending',
                },
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    return (
        <div>
            <h2>Battery Swap Bookings</h2>
            {loading ? (
                <p>Loading bookings...</p>
            ) : bookings.length === 0 ? (
                <p>No bookings found.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Customer</th>
                            <th>Battery Type</th>
                            <th>Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map((booking) => (
                            <tr key={booking.id}>
                                <td>{booking.id}</td>
                                <td>{booking.customer}</td>
                                <td>{booking.batteryType}</td>
                                <td>{booking.date}</td>
                                <td>{booking.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default Bookings;