import React, { useState } from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { FaChartLine } from 'react-icons/fa';
import html2canvas from 'html2canvas';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';

dayjs.locale('ru');

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const StatisticPanel = ({ buildingId, onClose }) => {
  const [period, setPeriod] = useState('day');
  const [date, setDate] = useState('');
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [selectedMonth, setSelectedMonth] = useState(dayjs().month());
  const [selectedYear, setSelectedYear] = useState(dayjs().year());

  const chartRef = React.useRef();

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    let url = 'http://194.67.84.115:8881';
    if (!buildingId) {
      setError('Укажите ID здания');
      setLoading(false);
      return;
    }
    try {
      let resultData = [];
      if (period === 'day') {
        url += `/api/building-download-statistics/day/${buildingId}?date=${date}`;
        const token = localStorage.getItem('token');
        const res = await axios.get(url, { headers: { 'Authorization': `Bearer ${token}` } });
        resultData = Array.isArray(res.data) ? res.data : [];
      } else if (period === 'week') {
        const from = dayjs(dateRange.from);
        const to = dayjs(dateRange.to);
        const days = [];
        for (let d = from; d.isBefore(to) || d.isSame(to, 'day'); d = d.add(1, 'day')) {
          days.push(d.format('YYYY-MM-DD'));
        }
        const token = localStorage.getItem('token');
        const promises = days.map(day =>
          axios.get(`http://194.67.84.115:8881/api/building-download-statistics/day/${buildingId}?date=${day}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }).then(res => ({ date: day, downloadCount: Math.max(0, Number(res.data[0]?.downloadCount) || 0) })).catch(() => ({ date: day, downloadCount: 0 }))
        );
        resultData = await Promise.all(promises);
      } else if (period === 'month') {
        const daysInMonth = dayjs(`${selectedYear}-${selectedMonth + 1}-01`).daysInMonth();
        const days = Array.from({ length: daysInMonth }, (_, i) => dayjs(`${selectedYear}-${selectedMonth + 1}-${i + 1}`).format('YYYY-MM-DD'));
        const token = localStorage.getItem('token');
        const promises = days.map(day =>
          axios.get(`http://194.67.84.115:8881/api/building-download-statistics/day/${buildingId}?date=${day}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }).then(res => ({ date: day, downloadCount: Math.max(0, Number(res.data[0]?.downloadCount) || 0) })).catch(() => ({ date: day, downloadCount: 0 }))
        );
        resultData = await Promise.all(promises);
      }
      setData(resultData);
    } catch (e) {
      setError('Ошибка загрузки статистики');
    }
    setLoading(false);
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    saveAs(blob, 'statistic.json');
  };

  const exportXLSX = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Statistic');
    const xlsxData = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([xlsxData], { type: 'application/octet-stream' });
    saveAs(blob, 'statistic.xlsx');
  };

  const saveChartAsImage = async (format = 'png') => {
    if (!chartRef.current) return;
    const chartCanvas = chartRef.current.canvas || chartRef.current;

    const parent = chartCanvas.parentNode;
    const prevBg = parent.style.backgroundColor;
    parent.style.backgroundColor = '#fff';
    const canvas = await html2canvas(parent, { backgroundColor: '#fff', useCORS: true, scale: 2 });
    parent.style.backgroundColor = prevBg;
    const link = document.createElement('a');
    link.download = `statistic_chart.${format}`;
    link.href = canvas.toDataURL(`image/${format === 'jpeg' ? 'jpeg' : 'png'}`);
    link.click();
  };

  return (
    <div style={{
      padding: 32,
      background: 'linear-gradient(135deg, #f8fafc 60%, #e0e7ef 100%)',
      borderRadius: 18,
      maxWidth: 480,
      minWidth: 320,
      boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
      border: '1.5px solid #e3e8f0',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      {typeof onClose === 'function' && (
        <button
          onClick={onClose}
          aria-label="Закрыть статистику"
          style={{
            position: 'absolute',
            top: 16,
            right: 20,
            background: 'none',
            border: 'none',
            fontSize: 28,
            color: '#64748b',
            cursor: 'pointer',
            zIndex: 10,
            padding: 0,
            lineHeight: 1
          }}
        >
          ×
        </button>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <FaChartLine size={28} color="#3b82f6" style={{ filter: 'drop-shadow(0 2px 6px #c7d2fe)' }} />
        <h2 style={{ margin: 0, fontWeight: 700, fontSize: 22, color: '#22223b', letterSpacing: 0.5 }}>Статистика скачиваний</h2>
      </div>
      <div style={{ marginBottom: 18, width: '100%' }}>
        <label style={{ color: '#64748b', fontWeight: 500 }}>ID здания: </label>
        <input value={buildingId || ''} disabled style={{ background: '#f1f5f9', color: '#888', width: 120, border: 'none', borderRadius: 6, padding: '4px 8px', marginLeft: 8 }} />
      </div>
      <div style={{ marginBottom: 18, width: '100%' }}>
        <label style={{ color: '#64748b', fontWeight: 500 }}>Период: </label>
        <select value={period} onChange={e => setPeriod(e.target.value)} style={{ marginLeft: 8, borderRadius: 6, padding: '4px 8px', border: '1px solid #cbd5e1', background: '#fff' }}>
          <option value="day">День</option>
          <option value="week">Неделя</option>
          <option value="month">Месяц</option>
        </select>
      </div>
      {period === 'day' && (
        <div style={{ marginBottom: 18, width: '100%' }}>
          <label style={{ color: '#64748b', fontWeight: 500 }}>Дата: </label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ marginLeft: 8, borderRadius: 6, padding: '4px 8px', border: '1px solid #cbd5e1', background: '#fff' }} />
        </div>
      )}
      {period === 'week' && (
        <div style={{ marginBottom: 18, width: '100%', display: 'flex', alignItems: 'center', gap: 12 }}>
          <label style={{ color: '#64748b', fontWeight: 500 }}>С: </label>
          <input type="date" value={dateRange.from} onChange={e => setDateRange(r => ({ ...r, from: e.target.value }))} style={{ borderRadius: 6, padding: '4px 8px', border: '1px solid #cbd5e1', background: '#fff' }} />
          <label style={{ color: '#64748b', fontWeight: 500 }}>По: </label>
          <input type="date" value={dateRange.to} onChange={e => setDateRange(r => ({ ...r, to: e.target.value }))} style={{ borderRadius: 6, padding: '4px 8px', border: '1px solid #cbd5e1', background: '#fff' }} />
        </div>
      )}
      {period === 'month' && (
        <div style={{ marginBottom: 18, width: '100%', display: 'flex', alignItems: 'center', gap: 12 }}>
          <label style={{ color: '#64748b', fontWeight: 500 }}>Месяц: </label>
          <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))} style={{ borderRadius: 6, padding: '4px 8px', border: '1px solid #cbd5e1', background: '#fff' }}>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i}>{dayjs().month(i).format('MMMM')}</option>
            ))}
          </select>
          <label style={{ color: '#64748b', fontWeight: 500 }}>Год: </label>
          <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} style={{ borderRadius: 6, padding: '4px 8px', border: '1px solid #cbd5e1', background: '#fff' }}>
            {Array.from({ length: 8 }, (_, i) => dayjs().year() - 4 + i).map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      )}
      <button onClick={fetchStats} disabled={loading} style={{ marginBottom: 18, background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 24px', fontWeight: 600, fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px #c7d2fe', transition: 'background 0.2s' }}>
        Загрузить статистику
      </button>
      {error && <div style={{ color: '#ef4444', marginBottom: 12 }}>{error}</div>}
      <div style={{ margin: '10px 0 24px 0', width: '100%' }}>
        <Line
          ref={chartRef}
          data={{
            labels: data.length > 0 ? data.map(item => item.date) : ['Нет данных'],
            datasets: [
              {
                label: 'Скачивания',
                data: data.length > 0 ? data.map(item => item.downloadCount) : [0],
                fill: false,
                borderColor: '#3b82f6',
                backgroundColor: '#60a5fa',
                tension: 0.2,
                pointRadius: 4,
                pointHoverRadius: 7,
              },
            ],
          }}
          options={{
            responsive: true,
            plugins: {
              legend: { position: 'top' },
              title: { display: false },
            },
            scales: {
              x: { grid: { color: '#e5e7eb' }, ticks: { color: '#64748b' } },
              y: {
                grid: { color: '#e5e7eb' },
                ticks: { color: '#64748b' },
                min: 0,
                beginAtZero: true
              },
            },
          }}
        />
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
        <button onClick={exportJSON} disabled={!data.length} style={{ background: '#f59e42', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 600, fontSize: 15, cursor: !data.length ? 'not-allowed' : 'pointer', boxShadow: '0 2px 8px #fcd34d', transition: 'background 0.2s' }}>
          Экспорт в JSON
        </button>
        <button onClick={exportXLSX} disabled={!data.length} style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 600, fontSize: 15, cursor: !data.length ? 'not-allowed' : 'pointer', boxShadow: '0 2px 8px #6ee7b7', transition: 'background 0.2s' }}>
          Экспорт в XLSX
        </button>
        <button onClick={() => saveChartAsImage('png')} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer', boxShadow: '0 2px 8px #93c5fd', transition: 'background 0.2s' }}>
          Сохранить график (PNG)
        </button>
      </div>
    </div>
  );
};

export default StatisticPanel;
