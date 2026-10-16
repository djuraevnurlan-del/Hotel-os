import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const initialRooms = [
  {
    id: 1, name: 'Комната №1 (4 койки)', price: 1500, beds: [
      { id: '1-1', name: 'Койка 1', status: 'occupied', guest: 'Алексей С.', phone: '+996 555 123456', checkIn: '2026-10-15', checkOut: '2026-10-18', nights: 3, paymentStatus: 'paid', paymentMethod: 'Наличные', passportImage: null, services: [] },
      { id: '1-2', name: 'Койка 2', status: 'available', guest: '', phone: '', checkIn: '', checkOut: '', nights: 1, paymentStatus: 'unpaid', paymentMethod: 'Наличные', passportImage: null, services: [] },
      { id: '1-3', name: 'Койка 3', status: 'reserved', guest: 'Данияр К.', phone: '+996 700 987654', checkIn: '2026-10-18', checkOut: '2026-10-20', nights: 2, paymentStatus: 'partial', paymentMethod: 'QR-код', passportImage: null, services: [] },
      { id: '1-4', name: 'Койка 4', status: 'cleaning', guest: '', phone: '', checkIn: '', checkOut: '', nights: 1, paymentStatus: 'unpaid', paymentMethod: 'Наличные', passportImage: null, services: [] }
    ]
  },
  {
    id: 2, name: 'Комната №2 (6 коек)', price: 1200, beds: Array.from({ length: 6 }, (_, i) => ({
      id: `2-${i+1}`, name: `Койка ${i+1}`, status: i === 0 ? 'occupied' : 'available', guest: i === 0 ? 'Игорь Т.' : '', phone: i === 0 ? '+996 772 111222' : '', checkIn: i === 0 ? '2026-10-13' : '', checkOut: i === 0 ? '2026-10-16' : '', nights: i === 0 ? 3 : 1, paymentStatus: 'paid', paymentMethod: 'Наличные', passportImage: null, services: []
    }))
  },
  {
    id: 3, name: 'Комната №3 (10 коек)', price: 1000, beds: Array.from({ length: 10 }, (_, i) => ({
      id: `3-${i+1}`, name: `Койка ${i+1}`, status: 'available', guest: '', phone: '', checkIn: '', checkOut: '', nights: 1, paymentStatus: 'unpaid', paymentMethod: 'Наличные', passportImage: null, services: []
    }))
  },
  {
    id: 4, name: 'Комната №4 (4 койки)', price: 1500, beds: Array.from({ length: 4 }, (_, i) => ({
      id: `4-${i+1}`, name: `Койка ${i+1}`, status: 'available', guest: '', phone: '', checkIn: '', checkOut: '', nights: 1, paymentStatus: 'unpaid', paymentMethod: 'Наличные', passportImage: null, services: []
    }))
  }
];

const guestHistoryDatabase = { 'Алексей С.': 3, 'Игорь Т.': 2, 'Данияр К.': 1 };

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('hostel_auth') === 'true');
  const [userRole, setUserRole] = useState(() => localStorage.getItem('hostel_user_role') || 'staff');
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [activeTab, setActiveTab] = useState('grid');

  const [ownerPin, setOwnerPin] = useState('2026');
  const [staffPin, setStaffPin] = useState('1111');
  const [newOwnerPinInput, setNewOwnerPinInput] = useState('');
  const [newStaffPinInput, setNewStaffPinInput] = useState('');

  const [hotelName, setHotelName] = useState('HOSTEL OS PRO');
  const [editHotelName, setEditHotelName] = useState(hotelName);

  const [rooms, setRooms] = useState(initialRooms);
  const [expenses, setExpenses] = useState([{ id: 1, title: 'Закуп воды', amount: 2500 }]);
  const [newExpTitle, setNewExpTitle] = useState('');
  const [newExpAmount, setNewExpAmount] = useState('');

  const [staff, setStaff] = useState([{ id: 1, name: 'Нурлан (Админ)', pay: 1500 }]);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffPay, setNewStaffPay] = useState('');

  const [startShiftCash, setStartShiftCash] = useState(10000);
  const [encashmentLog, setEncashmentLog] = useState([]);

  const [shiftNotes, setShiftNotes] = useState([
    { id: 1, author: 'Нурлан', text: 'Wi-Fi: Hostel_Free_WiFi / hostel2026. Кухня до 23:00.', date: '15.10.2026' }
  ]);
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteAuthor, setNewNoteAuthor] = useState('');

  const [cameras, setCameras] = useState([{ id: 1, title: 'Камера 1 (Ресепшен)', url: '' }]);
  const [camTitle, setCamTitle] = useState('');
  const [camUrl, setCamUrl] = useState('');

  const [selectedBed, setSelectedBed] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [bedStatus, setBedStatus] = useState('available');
  const [paymentStatus, setPaymentStatus] = useState('unpaid');
  const [paymentMethod, setPaymentMethod] = useState('Наличные');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [stayNights, setStayNights] = useState(1);
  const [passportImage, setPassportImage] = useState(null);
  const [extraCategory, setExtraCategory] = useState('Штраф');
  const [extraName, setExtraName] = useState('');
  const [extraPrice, setExtraPrice] = useState('');
  const [searchQuery, setSearchQuery] = useState('');// Загрузка данных из Supabase при старте приложения
  useEffect(() => {
    async function fetchDataFromSupabase() {
      try {
        const { data, error } = await supabase.from('hotel_data').select('*');
        if (error) {
          console.error('Ошибка загрузки из Supabase:', error);
          return;
        }
        if (data && data.length > 0) {
          data.forEach(row => {
            if (row.key === 'rooms' && row.value) setRooms(row.value);
            if (row.key === 'expenses' && row.value) setExpenses(row.value);
            if (row.key === 'staff' && row.value) setStaff(row.value);
            if (row.key === 'shiftNotes' && row.value) setShiftNotes(row.value);
            if (row.key === 'cameras' && row.value) setCameras(row.value);
            if (row.key === 'hotelName' && row.value) {
              setHotelName(row.value);
              setEditHotelName(row.value);
            }
            if (row.key === 'startShiftCash' && row.value) setStartShiftCash(Number(row.value));
            if (row.key === 'encashmentLog' && row.value) setEncashmentLog(row.value);
            if (row.key === 'ownerPin' && row.value) setOwnerPin(row.value);
            if (row.key === 'staffPin' && row.value) setStaffPin(row.value);
          });
        }
      } catch (err) {
        console.error('Сбой подключения к Supabase:', err);
      }
    }
    fetchDataFromSupabase();
  }, []);

  // Универсальная функция для сохранения состояния в Supabase
  const saveToSupabase = async (key, value) => {
    try {
      await supabase
        .from('hotel_data')
        .upsert({ key, value }, { onConflict: 'key' });
    } catch (err) {
      console.error('Ошибка сохранения в Supabase:', err);
    }
  };

  const handleRoomsUpdate = (newRooms) => {
    setRooms(newRooms);
    saveToSupabase('rooms', newRooms);
  };

  const handleExpensesUpdate = (newExp) => {
    setExpenses(newExp);
    saveToSupabase('expenses', newExp);
  };

  const handleStaffUpdate = (newStaff) => {
    setStaff(newStaff);
    saveToSupabase('staff', newStaff);
  };

  const handleNotesUpdate = (newNotes) => {
    setShiftNotes(newNotes);
    saveToSupabase('shiftNotes', newNotes);
  };

  const handleCamerasUpdate = (newCams) => {
    setCameras(newCams);
    saveToSupabase('cameras', newCams);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (pinInput === ownerPin) {
      setIsAuthenticated(true);
      setUserRole('owner');
      localStorage.setItem('hostel_auth', 'true');
      localStorage.setItem('hostel_user_role', 'owner');
      setPinError(false);
    } else if (pinInput === staffPin) {
      setIsAuthenticated(true);
      setUserRole('staff');
      localStorage.setItem('hostel_auth', 'true');
      localStorage.setItem('hostel_user_role', 'staff');
      setPinError(false);
    } else {
      setPinError(true);
      setPinInput('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('hostel_auth');
    localStorage.removeItem('hostel_user_role');
  };

  const handleCheckInChange = (newIn) => {
    setCheckInDate(newIn);
    if (newIn && checkOutDate) {
      const diff = Math.round((new Date(checkOutDate) - new Date(newIn)) / (1000 * 60 * 60 * 24));
      if (diff > 0) setStayNights(diff);
    }
  };

  const handleCheckOutChange = (newOut) => {
    setCheckOutDate(newOut);
    if (checkInDate && newOut) {
      const diff = Math.round((new Date(newOut) - new Date(checkInDate)) / (1000 * 60 * 60 * 24));
      if (diff > 0) setStayNights(diff);
    }
  };

  const handleNightsChange = (n) => {
    const num = parseInt(n) || 1;
    setStayNights(num);
    if (checkInDate) {
      const d = new Date(checkInDate);
      d.setDate(d.getDate() + num);
      setCheckOutDate(d.toISOString().split('T')[0]);
    }
  };

  const openBedModal = (room, bed) => {
    setSelectedRoom(room);
    setSelectedBed(bed);
    setGuestName(bed.guest || '');
    setGuestPhone(bed.phone || '');
    setBedStatus(bed.status || 'available');
    setPaymentStatus(bed.paymentStatus || 'unpaid');
    setPaymentMethod(bed.paymentMethod || 'Наличные');
    setCheckInDate(bed.checkIn || '2026-10-15');
    setCheckOutDate(bed.checkOut || '2026-10-16');
    setStayNights(bed.nights || 1);
    setPassportImage(bed.passportImage || null);
    setShowModal(true);
  };

  const handlePassportUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPassportImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveBed = (e) => {
    e.preventDefault();
    const isClearing = bedStatus === 'available' || bedStatus === 'cleaning';
    const updatedRooms = rooms.map(r => r.id === selectedRoom.id ? {
      ...r, beds: r.beds.map(b => b.id === selectedBed.id ? {
        ...b,
        guest: isClearing ? '' : guestName,
        phone: isClearing ? '' : guestPhone,
        status: bedStatus,
        paymentStatus: isClearing ? 'unpaid' : paymentStatus,
        paymentMethod: isClearing ? 'Наличные' : paymentMethod,
        checkIn: isClearing ? '' : checkInDate,
        checkOut: isClearing ? '' : checkOutDate,
        nights: isClearing ? 1 : parseInt(stayNights || 1),
        passportImage: isClearing ? null : passportImage,
        services: isClearing ? [] : b.services
      } : b)
    } : r);
    handleRoomsUpdate(updatedRooms);
    setShowModal(false);
  };

  const addExtraService = () => {
    if (!extraName || !extraPrice) return;
    const updatedServices = [...selectedBed.services, { name: `${extraCategory}: ${extraName}`, price: parseFloat(extraPrice) }];
    const updatedRooms = rooms.map(r => r.id === selectedRoom.id ? {
      ...r, beds: r.beds.map(b => b.id === selectedBed.id ? { ...b, services: updatedServices } : b)
    } : r);
    handleRoomsUpdate(updatedRooms);
    setSelectedBed({ ...selectedBed, services: updatedServices });
    setExtraName(''); setExtraPrice('');
  };

  const removeService = (idx) => {
    const updatedServices = selectedBed.services.filter((_, i) => i !== idx);
    const updatedRooms = rooms.map(r => r.id === selectedRoom.id ? {
      ...r, beds: r.beds.map(b => b.id === selectedBed.id ? { ...b, services: updatedServices } : b)
    } : r);
    handleRoomsUpdate(updatedRooms);
    setSelectedBed({ ...selectedBed, services: updatedServices });
  };

  const handleCheckOut = () => {
    const updatedRooms = rooms.map(r => r.id === selectedRoom.id ? {
      ...r, beds: r.beds.map(b => b.id === selectedBed.id ? {
        ...b, guest: '', phone: '', status: 'cleaning', paymentStatus: 'unpaid',
        paymentMethod: 'Наличные', checkIn: '', checkOut: '', nights: 1, passportImage: null, services: []
      } : b)
    } : r);
    handleRoomsUpdate(updatedRooms);
    setShowModal(false);
  };

  const calculateStayProgress = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return null;
    const today = new Date('2026-10-15');
    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);
    const daysLived = Math.floor((today - inDate) / (1000 * 60 * 60 * 24));
    const daysLeft = Math.ceil((outDate - today) / (1000 * 60 * 60 * 24));
    if (daysLived < 0) return <span style={{ color: '#fbbf24' }}>⏳ До заезда: {Math.abs(daysLived)} дн.</span>;
    if (daysLeft > 0) return <span style={{ color: '#38bdf8' }}>🏡 Прожил: {daysLived + 1} дн. | Осталось: {daysLeft} дн.</span>;
    return <span style={{ color: '#f87171' }}>⚠️ День выезда!</span>;
  };

  const updateRoomPrice = (roomId, newPrice) => {
    const updatedRooms = rooms.map(r => r.id === roomId ? { ...r, price: parseFloat(newPrice) || 0 } : r);
    handleRoomsUpdate(updatedRooms);
  };

  let cashIncome = 0, nonCashIncome = 0, occCount = 0, resCount = 0, clnCount = 0;
  rooms.forEach(r => r.beds.forEach(b => {
    if (b.status === 'occupied') {
      occCount++;
      const stayCost = r.price * (b.nights || 1);
      if (b.paymentMethod === 'Наличные') cashIncome += stayCost;
      else nonCashIncome += stayCost;
    } else if (b.status === 'reserved') resCount++;
    else if (b.status === 'cleaning') clnCount++;

    b.services.forEach(s => {
      if (b.paymentMethod === 'Наличные') cashIncome += s.price;
      else nonCashIncome += s.price;
    });
  }));

  const totalRev = cashIncome + nonCashIncome;
  const totalExp = expenses.reduce((a, c) => a + c.amount, 0);
  const totalEncashment = encashmentLog.reduce((a, c) => a + c.amount, 0);
  const currentCashInDrawer = startShiftCash + cashIncome - totalExp - totalEncashment;

  const handleEncashment = () => {
    if (currentCashInDrawer <= 0) return alert('В кассе нет наличных денег!');
    const amount = prompt(`Введите сумму, которую забрал Владелец из кассы (Макс: ${currentCashInDrawer} KGS):`, currentCashInDrawer.toString());
    if (amount && !isNaN(amount)) {
      const val = parseFloat(amount);
      const newEntry = {
        id: Date.now(),
        amount: val,
        date: new Date().toLocaleDateString('ru-RU') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        user: userRole === 'owner' ? 'Владелец' : 'Администратор'
      };
      const updatedLog = [newEntry, ...encashmentLog];
      setEncashmentLog(updatedLog);
      saveToSupabase('encashmentLog', updatedLog);
      alert(`Успешно изъято из кассы: ${val} KGS.`);
    }
  };

  const handleCloseShift = () => {
    alert(`Смена сдана! Наличность к передаче сменщику: ${currentCashInDrawer} KGS. Не забудьте проверить разменный баланс (${startShiftCash} KGS).`);
  };if (!isAuthenticated) {
    return (
      <div style={{ fontFamily: 'sans-serif', backgroundColor: '#070b14', color: '#fff', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ backgroundColor: '#0f172a', padding: '36px', borderRadius: '16px', border: '1px solid #1e293b', width: '380px', textAlign: 'center', boxShadow: '0 25px 50px rgba(0,0,0,0.6)' }}>
          <div style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: '#fff', fontWeight: '900', padding: '10px 16px', borderRadius: '10px', fontSize: '16px', marginBottom: '24px', display: 'inline-block' }}>{hotelName}</div>
          <h2 style={{ fontSize: '18px', margin: '0 0 8px 0', color: '#f8fafc' }}>Вход в систему</h2>
          <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '24px' }}>Введите ПИН-код пользователя</p>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <input type="password" placeholder="••••" maxLength="6" value={pinInput} onChange={e => setPinInput(e.target.value)} style={{ padding: '12px', backgroundColor: '#070b14', border: pinError ? '1px solid #ef4444' : '1px solid #1e293b', color: '#fff', borderRadius: '8px', textAlign: 'center', fontSize: '20px', letterSpacing: '4px' }} />
            {pinError && <span style={{ color: '#ef4444', fontSize: '11px' }}>Неверный ПИН-код!</span>}
            <button type="submit" style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Войти</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#070b14', color: '#f1f5f9', minHeight: '100vh', fontSize: '13px' }}>
      <header style={{ backgroundColor: '#0f172a', padding: '16px 28px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: '#fff', fontWeight: '900', padding: '8px 14px', borderRadius: '10px', fontSize: '15px' }}>{hotelName}</div>
          <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', backgroundColor: userRole === 'owner' ? '#16a34a33' : '#3b82f633', color: userRole === 'owner' ? '#4ade80' : '#60a5fa', border: userRole === 'owner' ? '1px solid #22c55e44' : '1px solid #3b82f644' }}>
            {userRole === 'owner' ? '👑 Владелец' : '👤 Администратор'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', gap: '18px', backgroundColor: '#090d16', padding: '10px 20px', borderRadius: '10px', border: '1px solid #1e293b' }}>
            <div>Наличные в ящике: <strong style={{ color: '#38bdf8' }}>{currentCashInDrawer.toLocaleString()} KGS</strong></div>
            {userRole === 'owner' && (
              <div>Общий приход: <strong style={{ color: '#4ade80' }}>{totalRev.toLocaleString()} KGS</strong></div>
            )}
          </div>
          <button onClick={handleLogout} style={{ backgroundColor: '#7f1d1d', color: '#fca5a5', border: 'none', padding: '10px 14px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Выйти</button>
        </div>
      </header>

      <nav style={{ backgroundColor: '#0f172a', padding: '0 28px', borderBottom: '1px solid #1e293b', display: 'flex', gap: '6px' }}>
        {[ 
          { id: 'grid', label: '🛏️ Шахматка' }, 
          { id: 'finance', label: '📊 Касса и Финансы' }, 
          { id: 'staff', label: '👥 Персонал' }, 
          { id: 'notes', label: '📝 Заметки смен' }, 
          { id: 'cameras', label: '🎥 Камеры' }, 
          ...(userRole === 'owner' ? [{ id: 'settings', label: '⚙️ Настройки' }] : [])
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: '14px 22px', backgroundColor: activeTab === tab.id ? '#1e293b' : 'transparent', color: activeTab === tab.id ? '#38bdf8' : '#94a3b8', border: 'none', borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent', fontWeight: '600', cursor: 'pointer' }}>{tab.label}</button>
        ))}
      </nav>

      <main style={{ padding: '28px' }}>
        {activeTab === 'grid' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
              <div style={{ display: 'flex', gap: '16px', backgroundColor: '#0f172a', padding: '14px 20px', borderRadius: '12px', border: '1px solid #1e293b' }}>
                <div>Занято: <strong style={{ color: '#ef4444' }}>{occCount}</strong></div>
                <div>Бронь: <strong style={{ color: '#f59e0b' }}>{resCount}</strong></div>
                <div>Уборка: <strong style={{ color: '#a855f7' }}>{clnCount}</strong></div>
                <div>Свободно: <strong style={{ color: '#22c55e' }}>{24 - (occCount + resCount + clnCount)}</strong></div>
              </div>
              <input type="text" placeholder="🔍 Поиск гостя по имени..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ padding: '12px 16px', backgroundColor: '#0f172a', border: '1px solid #1e293b', color: '#fff', borderRadius: '10px', width: '280px', fontSize: '13px' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {rooms.map(room => {
                const filteredBeds = room.beds.filter(b => b.guest.toLowerCase().includes(searchQuery.toLowerCase()) || searchQuery === '');
                if (filteredBeds.length === 0 && searchQuery !== '') return null;
                return (
                  <div key={room.id} style={{ backgroundColor: '#0f172a', borderRadius: '14px', padding: '20px', border: '1px solid #1e293b' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #1e293b', paddingBottom: '12px' }}>
                      <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#f8fafc' }}>{room.name}</h3>
                      <span style={{ backgroundColor: '#1e3a8a33', color: '#60a5fa', border: '1px solid #3b82f644', padding: '5px 12px', borderRadius: '8px', fontSize: '12px' }}>{room.price} KGS / ночь</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' }}>
                      {filteredBeds.map(bed => {
                        const borderColor = bed.status === 'occupied' ? '#ef4444' : bed.status === 'reserved' ? '#f59e0b' : bed.status === 'cleaning' ? '#a855f7' : '#22c55e';
                        const totalStayPrice = (room.price * (bed.nights || 1)) + bed.services.reduce((a, s) => a + s.price, 0);
                        const visits = guestHistoryDatabase[bed.guest] || (bed.guest ? 1 : 0);
                        return (
                          <div key={bed.id} onClick={() => openBedModal(room, bed)} style={{ backgroundColor: '#070b14', border: `2px solid ${borderColor}`, borderRadius: '12px', padding: '14px', cursor: 'pointer' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                              <strong style={{ fontSize: '13px', color: '#fff' }}>{bed.name}</strong>
                              <span style={{ fontSize: '10px', fontWeight: '700', color: borderColor }}>{bed.status === 'occupied' ? 'Проживает' : bed.status === 'reserved' ? 'Бронь' : bed.status === 'cleaning' ? 'Уборка' : 'Свободно'}</span>
                            </div>
                            {bed.status === 'occupied' || bed.status === 'reserved' ? (
                              <div>
                                <div style={{ fontWeight: '600', color: '#f8fafc', fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
                                  <span>👤 {bed.guest}</span>
                                  {visits > 1 && <span style={{ fontSize: '10px', backgroundColor: '#3b82f633', color: '#60a5fa', padding: '1px 5px', borderRadius: '4px' }}>⭐ {visits} визит</span>}
                                </div>
                                <div style={{ fontSize: '10px', marginTop: '4px', color: bed.paymentStatus === 'paid' ? '#4ade80' : bed.paymentStatus === 'partial' ? '#fbbf24' : '#f87171' }}>
                                  {bed.paymentStatus === 'paid' ? '🟢 Оплачено' : bed.paymentStatus === 'partial' ? '🟡 Предоплата' : '🔴 Не оплачено'} ({bed.paymentMethod})
                                </div>
                                {bed.checkIn && bed.checkOut && (
                                  <div style={{ marginTop: '4px' }}>
                                    <div style={{ color: '#94a3b8', fontSize: '10px' }}>📅 {bed.checkIn} — {bed.checkOut} ({bed.nights} ноч.)</div>
                                    <div style={{ fontSize: '11px', marginTop: '2px' }}>{calculateStayProgress(bed.checkIn, bed.checkOut)}</div>
                                  </div>
                                )}
                                <div style={{ color: '#38bdf8', fontSize: '11px', fontWeight: 'bold', marginTop: '6px', borderTop: '1px solid #1e293b', paddingTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
                                  <span>Счет: {totalStayPrice} KGS</span>
                                  {bed.passportImage && <span style={{ color: '#4ade80' }}>📄 Паспорт</span>}
                                </div>
                              </div>
                            ) : (
                              <div style={{ color: '#64748b', fontSize: '11px', marginTop: '6px' }}>Нажмите для заселения</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}{activeTab === 'finance' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
            <div style={{ backgroundColor: '#0f172a', padding: '24px', borderRadius: '14px', border: '1px solid #1e293b' }}>
              <h3 style={{ marginTop: 0, fontSize: '16px', marginBottom: '16px' }}>Учет мелких расходов / Закупок</h3>
              <form onSubmit={e => { 
                e.preventDefault(); 
                if(!newExpTitle || !newExpAmount) return; 
                const updatedExp = [...expenses, { id: Date.now(), title: newExpTitle, amount: parseFloat(newExpAmount) }];
                handleExpensesUpdate(updatedExp);
                setNewExpTitle(''); setNewExpAmount(''); 
              }} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input type="text" placeholder="Закуп чего (например, бытовая химия)" value={newExpTitle} onChange={e => setNewExpTitle(e.target.value)} style={{ flex: 2, padding: '10px 14px', backgroundColor: '#070b14', border: '1px solid #1e293b', color: '#fff', borderRadius: '8px' }} />
                <input type="number" placeholder="Сумма KGS" value={newExpAmount} onChange={e => setNewExpAmount(e.target.value)} style={{ flex: 1, padding: '10px 14px', backgroundColor: '#070b14', border: '1px solid #1e293b', color: '#fff', borderRadius: '8px' }} />
                <button type="submit" style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Взять из кассы</button>
              </form>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#1e293b', color: '#94a3b8' }}>
                    <th style={{ padding: '10px 14px' }}>Статья расхода</th>
                    <th style={{ padding: '10px 14px' }}>Сумма</th>
                    <th style={{ padding: '10px 14px', width: '60px' }}>Удалить</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map(ex => (
                    <tr key={ex.id} style={{ borderBottom: '1px solid #1e293b' }}>
                      <td style={{ padding: '12px 14px' }}>{ex.title}</td>
                      <td style={{ padding: '12px 14px', color: '#f87171', fontWeight: '700' }}>-{ex.amount} KGS</td>
                      <td style={{ padding: '12px 14px' }}><button onClick={() => handleExpensesUpdate(expenses.filter(i => i.id !== ex.id))} style={{ backgroundColor: '#7f1d1d', color: '#fca5a5', border: 'none', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer' }}>✕</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ backgroundColor: '#0f172a', padding: '24px', borderRadius: '14px', border: '1px solid #1e293b' }}>
              <h3 style={{ marginTop: 0, fontSize: '16px', marginBottom: '16px', color: '#38bdf8' }}>💵 Денежный ящик и сдача смены</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '10px' }}>
                  <span>Разменные деньги (неснижаемый остаток):</span>
                  <strong>{startShiftCash} KGS</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '10px' }}>
                  <span>Принято наличными за смену:</span>
                  <strong style={{ color: '#4ade80' }}>+{cashIncome} KGS</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '10px' }}>
                  <span>Принято на QR / Карта (на банк. счет):</span>
                  <strong style={{ color: '#60a5fa' }}>+{nonCashIncome} KGS</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '10px' }}>
                  <span>Расходы из кассы (закупы):</span>
                  <strong style={{ color: '#f87171' }}>-{totalExp} KGS</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '10px' }}>
                  <span>Изъято Владельцем (Инкассация):</span>
                  <strong style={{ color: '#fbbf24' }}>-{totalEncashment} KGS</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: '800', paddingTop: '8px', backgroundColor: '#070b14', padding: '12px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                  <span>Должно лежать в ящике кассы:</span>
                  <span style={{ color: '#38bdf8' }}>{currentCashInDrawer} KGS</span>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                  <button onClick={handleEncashment} style={{ flex: 1, backgroundColor: '#d97706', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>🏦 Изъять наличные (Инкассация)</button>
                  <button onClick={handleCloseShift} style={{ flex: 1, backgroundColor: '#059669', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>🔒 Передать смену</button>
                </div>
              </div>

              <div style={{ marginTop: '24px', borderTop: '1px solid #1e293b', paddingTop: '16px' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#fbbf24' }}>📜 История изъятий денег из кассы:</h4>
                {encashmentLog.length === 0 ? (
                  <span style={{ color: '#64748b', fontSize: '11px' }}>Изъятий пока не было</span>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '150px', overflowY: 'auto' }}>
                    {encashmentLog.map(item => (
                      <div key={item.id} style={{ backgroundColor: '#070b14', padding: '8px 12px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                        <span>{item.date} ({item.user})</span>
                        <strong style={{ color: '#fbbf24' }}>-{item.amount} KGS</strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'staff' && (
          <div style={{ maxWidth: '650px', backgroundColor: '#0f172a', padding: '24px', borderRadius: '14px', border: '1px solid #1e293b' }}>
            <h3 style={{ marginTop: 0, fontSize: '16px', marginBottom: '16px' }}>Управление персоналом</h3>
            <form onSubmit={e => { 
              e.preventDefault(); 
              if(!newStaffName || !newStaffPay) return; 
              const updatedStaff = [...staff, { id: Date.now(), name: newStaffName, pay: parseFloat(newStaffPay) }];
              handleStaffUpdate(updatedStaff);
              setNewStaffName(''); setNewStaffPay(''); 
            }} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <input type="text" placeholder="ФИО сотрудника" value={newStaffName} onChange={e => setNewStaffName(e.target.value)} style={{ flex: 2, padding: '10px 14px', backgroundColor: '#070b14', border: '1px solid #1e293b', color: '#fff', borderRadius: '8px' }} />
              <input type="number" placeholder="Оплата KGS" value={newStaffPay} onChange={e => setNewStaffPay(e.target.value)} style={{ flex: 1, padding: '10px 14px', backgroundColor: '#070b14', border: '1px solid #1e293b', color: '#fff', borderRadius: '8px' }} />
              <button type="submit" style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Добавить</button>
            </form>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#1e293b', color: '#94a3b8' }}>
                  <th style={{ padding: '10px 14px' }}>Сотрудник</th>
                  <th style={{ padding: '10px 14px' }}>Оплата за смену</th>
                  <th style={{ padding: '10px 14px', width: '80px' }}>Удалить</th>
                </tr>
              </thead>
              <tbody>
                {staff.map(st => (
                  <tr key={st.id} style={{ borderBottom: '1px solid #1e293b' }}>
                    <td style={{ padding: '12px 14px', fontWeight: '600' }}>{st.name}</td>
                    <td style={{ padding: '12px 14px' }}>{st.pay} KGS</td>
                    <td style={{ padding: '12px 14px' }}><button onClick={() => handleStaffUpdate(staff.filter(i => i.id !== st.id))} style={{ backgroundColor: '#7f1d1d', color: '#fca5a5', border: 'none', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer' }}>✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'notes' && (
          <div style={{ maxWidth: '700px', backgroundColor: '#0f172a', padding: '24px', borderRadius: '14px', border: '1px solid #1e293b' }}>
            <h3 style={{ marginTop: 0, fontSize: '16px', marginBottom: '8px', color: '#38bdf8' }}>📝 Заметки и передача смены</h3>
            <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '20px' }}>Здесь администраторы могут оставлять важные сообщения для следующей смены.</p>
            
            <form onSubmit={e => {
              e.preventDefault();
              if (!newNoteText || !newNoteAuthor) return;
              const newNote = {
                id: Date.now(),
                author: newNoteAuthor,
                text: newNoteText,
                date: new Date().toLocaleDateString('ru-RU') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              };
              const updatedNotes = [newNote, ...shiftNotes];
              handleNotesUpdate(updatedNotes);
              setNewNoteText('');
              setNewNoteAuthor('');
            }} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              <input type="text" placeholder="Ваше Имя / Админ" value={newNoteAuthor} onChange={e => setNewNoteAuthor(e.target.value)} style={{ padding: '10px 14px', backgroundColor: '#070b14', border: '1px solid #1e293b', color: '#fff', borderRadius: '8px' }} />
              <textarea placeholder="Текст заметки..." rows="3" value={newNoteText} onChange={e => setNewNoteText(e.target.value)} style={{ padding: '10px 14px', backgroundColor: '#070b14', border: '1px solid #1e293b', color: '#fff', borderRadius: '8px', resize: 'vertical' }} />
              <button type="submit" style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Добавить заметку</button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {shiftNotes.map(note => (
                <div key={note.id} style={{ backgroundColor: '#070b14', padding: '14px', borderRadius: '10px', border: '1px solid #1e293b', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '11px', color: '#94a3b8' }}>
                    <strong style={{ color: '#38bdf8', fontSize: '12px' }}>{note.author}</strong>
                    <span>{note.date}</span>
                  </div>
                  <div style={{ color: '#f8fafc', whiteSpace: 'pre-wrap', fontSize: '13px' }}>{note.text}</div>
                  <button onClick={() => handleNotesUpdate(shiftNotes.filter(n => n.id !== note.id))} style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '12px' }}>Удалить</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'cameras' && (
          <div style={{ backgroundColor: '#0f172a', padding: '24px', borderRadius: '14px', border: '1px solid #1e293b' }}>
            <h3 style={{ marginTop: 0, fontSize: '16px', marginBottom: '8px', color: '#38bdf8' }}>🎥 Видеонаблюдение отеля</h3>
            <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '20px' }}>Добавляйте ссылки на видеопоток или IP-камеры вашей системы наблюдения.</p>

            <form onSubmit={e => {
              e.preventDefault();
              if (!camTitle) return;
              const updatedCams = [...cameras, { id: Date.now(), title: camTitle, url: camUrl }];
              handleCamerasUpdate(updatedCams);
              setCamTitle('');
              setCamUrl('');
            }} style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <input type="text" placeholder="Название" value={camTitle} onChange={e => setCamTitle(e.target.value)} style={{ flex: 1, minWidth: '180px', padding: '10px 14px', backgroundColor: '#070b14', border: '1px solid #1e293b', color: '#fff', borderRadius: '8px' }} />
              <input type="text" placeholder="URL потока / IP-адрес" value={camUrl} onChange={e => setCamUrl(e.target.value)} style={{ flex: 2, minWidth: '240px', padding: '10px 14px', backgroundColor: '#070b14', border: '1px solid #1e293b', color: '#fff', borderRadius: '8px' }} />
              <button type="submit" style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Добавить камеру</button>
            </form>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {cameras.map(cam => (
                <div key={cam.id} style={{ backgroundColor: '#070b14', border: '1px solid #1e293b', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ padding: '12px 16px', backgroundColor: '#1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '13px', color: '#fff' }}>🔴 {cam.title}</strong>
                    <button onClick={() => handleCamerasUpdate(cameras.filter(c => c.id !== cam.id))} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '12px' }}>Удалить</button>
                  </div>
                  <div style={{ height: '220px', backgroundColor: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                    {cam.url ? (
                      <iframe src={cam.url} title={cam.title} style={{ width: '100%', height: '100%', border: '0' }} allow="autoplay; encrypted-media" allowFullScreen />
                    ) : (
                      <div style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>
                        <div style={{ fontSize: '32px', marginBottom: '8px' }}>📹</div>
                        <div>Укажите URL трансляции камеры</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && userRole === 'owner' && (
          <div style={{ maxWidth: '650px', backgroundColor: '#0f172a', padding: '24px', borderRadius: '14px', border: '1px solid #1e293b' }}>
            <h3 style={{ marginTop: 0, fontSize: '16px', marginBottom: '8px', color: '#38bdf8' }}>⚙️ Панель Настроек Владельца</h3>
            <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '20px' }}>Управление ПИН-кодами доступа и базовыми параметрами отеля.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px', backgroundColor: '#070b14', padding: '16px', borderRadius: '10px', border: '1px solid #1e293b' }}>
              <h4 style={{ margin: 0, color: '#fbbf24', fontSize: '13px' }}>🔑 Изменение ПИН-кодов доступа</h4>
              
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '11px', marginBottom: '4px' }}>Новый ПИН Владельца (текущий: {ownerPin})</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input type="password" maxLength="6" placeholder="Новый ПИН" value={newOwnerPinInput} onChange={e => setNewOwnerPinInput(e.target.value)} style={{ flex: 1, padding: '8px 12px', backgroundColor: '#0f172a', border: '1px solid #1e293b', color: '#fff', borderRadius: '6px' }} />
                  <button onClick={() => { 
                    if(newOwnerPinInput) { 
                      setOwnerPin(newOwnerPinInput); 
                      saveToSupabase('ownerPin', newOwnerPinInput);
                      setNewOwnerPinInput(''); 
                      alert('ПИН Владельца обновлен!'); 
                    } 
                  }} style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Сменить</button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '11px', marginBottom: '4px' }}>Новый ПИН Ресепшена (текущий: {staffPin})</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input type="password" maxLength="6" placeholder="Новый ПИН" value={newStaffPinInput} onChange={e => setNewStaffPinInput(e.target.value)} style={{ flex: 1, padding: '8px 12px', backgroundColor: '#0f172a', border: '1px solid #1e293b', color: '#fff', borderRadius: '6px' }} />
                  <button onClick={() => { 
                    if(newStaffPinInput) { 
                      setStaffPin(newStaffPinInput); 
                      saveToSupabase('staffPin', newStaffPinInput);
                      setNewStaffPinInput(''); 
                      alert('ПИН Администратора обновлен!'); 
                    } 
                  }} style={{ backgroundColor: '#059669', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Сменить</button>
                </div>
              </div>
            </div>

            <form onSubmit={e => {
              e.preventDefault();
              setHotelName(editHotelName);
              saveToSupabase('hotelName', editHotelName);
              alert('Название сохранено!');
            }} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '11px', marginBottom: '6px', fontWeight: '600' }}>Название отеля / хостела</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input type="text" value={editHotelName} onChange={e => setEditHotelName(e.target.value)} style={{ flex: 1, padding: '10px 14px', backgroundColor: '#070b14', border: '1px solid #1e293b', color: '#fff', borderRadius: '8px' }} />
                  <button type="submit" style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Сохранить</button>
                </div>
              </div>
            </form>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '11px', marginBottom: '6px', fontWeight: '600' }}>Стартовая разменная касса (KGS)</label>
              <input type="number" value={startShiftCash} onChange={e => {
                const val = parseFloat(e.target.value) || 0;
                setStartShiftCash(val);
                saveToSupabase('startShiftCash', val);
              }} style={{ width: '100%', padding: '10px 14px', backgroundColor: '#070b14', border: '1px solid #1e293b', color: '#fff', borderRadius: '8px' }} />
            </div>

            <hr style={{ borderColor: '#1e293b', margin: '20px 0' }} />

            <h4 style={{ margin: '0 0 14px 0', fontSize: '14px', color: '#f8fafc' }}>Изменение стоимости комнат за ночь (KGS):</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {rooms.map(room => (
                <div key={room.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#070b14', padding: '12px 16px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                  <span style={{ fontWeight: '600', color: '#f8fafc' }}>{room.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="number" value={room.price} onChange={e => updateRoomPrice(room.id, e.target.value)} style={{ width: '100px', padding: '8px 10px', backgroundColor: '#0f172a', border: '1px solid #1e293b', color: '#4ade80', fontWeight: 'bold', borderRadius: '6px', textAlign: 'right' }} />
                    <span style={{ color: '#94a3b8' }}>KGS</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {showModal && selectedBed && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(7,11,20,0.85)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#0f172a', width: '540px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '16px', border: '1px solid #1e293b' }}>
            <div style={{ backgroundColor: '#1e293b', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '15px' }}>{selectedRoom.name} — {selectedBed.name}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '18px' }}>✕</button>
            </div>
            <div style={{ padding: '24px' }}>
              <form onSubmit={handleSaveBed} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', color: '#94a3b8', fontSize: '11px', marginBottom: '4px', fontWeight: '600' }}>Статус койки</label>
                    <select value={bedStatus} onChange={e => setBedStatus(e.target.value)} style={{ width: '100%', padding: '10px 12px', backgroundColor: '#070b14', border: '1px solid #1e293b', color: '#fff', borderRadius: '8px' }}>
                      <option value="available">🟢 Свободно</option>
                      <option value="occupied">🔴 Занято (Проживает)</option>
                      <option value="reserved">🟠 Бронь</option>
                      <option value="cleaning">🟣 Уборка</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#94a3b8', fontSize: '11px', marginBottom: '4px', fontWeight: '600' }}>Оплата</label>
                    <select value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)} style={{ width: '100%', padding: '10px 12px', backgroundColor: '#070b14', border: '1px solid #1e293b', color: '#fff', borderRadius: '8px' }}>
                      <option value="paid">🟢 Оплачено</option>
                      <option value="partial">🟡 Предоплата</option>
                      <option value="unpaid">🔴 Не оплачено</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '11px', marginBottom: '4px', fontWeight: '600' }}>Метод оплаты</label>
                  <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} style={{ width: '100%', padding: '10px 12px', backgroundColor: '#070b14', border: '1px solid #1e293b', color: '#fff', borderRadius: '8px' }}>
                    <option value="Наличные">💵 Наличные (сом)</option>
                    <option value="QR-код">📱 QR-код / Банк</option>
                    <option value="ЭЛКАР">💳 ЭЛКАР / Терминал</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '11px', marginBottom: '4px', fontWeight: '600' }}>ФИО Гостя</label>
                  <input type="text" placeholder="Введите имя гостя" value={guestName} onChange={e => setGuestName(e.target.value)} style={{ width: '100%', padding: '10px 12px', backgroundColor: '#070b14', border: '1px solid #1e293b', color: '#fff', borderRadius: '8px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '11px', marginBottom: '4px', fontWeight: '600' }}>Номер телефона</label>
                  <input type="text" placeholder="+996 ..." value={guestPhone} onChange={e => setGuestPhone(e.target.value)} style={{ width: '100%', padding: '10px 12px', backgroundColor: '#070b14', border: '1px solid #1e293b', color: '#fff', borderRadius: '8px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '11px', marginBottom: '4px', fontWeight: '600' }}>Скан / Фото паспорта</label>
                  <input type="file" accept="image/*" onChange={handlePassportUpload} style={{ width: '100%', color: '#94a3b8', fontSize: '12px' }} />
                  {passportImage && (
                    <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img src={passportImage} alt="Паспорт" style={{ width: '70px', height: '45px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #3b82f6' }} />
                      <span style={{ color: '#4ade80', fontSize: '11px' }}>✓ Паспорт прикреплен</span>
                      <button type="button" onClick={() => setPassportImage(null)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '11px' }}>Удалить</button>
                    </div>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 90px', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', color: '#94a3b8', fontSize: '11px', marginBottom: '4px', fontWeight: '600' }}>Заезд</label>
                    <input type="date" value={checkInDate} onChange={e => handleCheckInChange(e.target.value)} style={{ width: '100%', padding: '8px 10px', backgroundColor: '#070b14', border: '1px solid #1e293b', color: '#fff', borderRadius: '8px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#94a3b8', fontSize: '11px', marginBottom: '4px', fontWeight: '600' }}>Выезд</label>
                    <input type="date" value={checkOutDate} onChange={e => handleCheckOutChange(e.target.value)} style={{ width: '100%', padding: '8px 10px', backgroundColor: '#070b14', border: '1px solid #1e293b', color: '#fff', borderRadius: '8px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#94a3b8', fontSize: '11px', marginBottom: '4px', fontWeight: '600' }}>Ночей</label>
                    <input type="number" min="1" value={stayNights} onChange={e => handleNightsChange(e.target.value)} style={{ width: '100%', padding: '8px 10px', backgroundColor: '#070b14', border: '1px solid #1e293b', color: '#fff', borderRadius: '8px' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                  <button type="submit" style={{ flex: 1, backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Сохранить</button>
                  {selectedBed.status === 'occupied' && (
                    <>
                      <button type="button" onClick={() => setShowInvoiceModal(true)} style={{ backgroundColor: '#059669', color: '#fff', border: 'none', padding: '12px 14px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>🖨️ Инвойс</button>
                      <button type="button" onClick={handleCheckOut} style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '12px 16px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Выселить</button>
                    </>
                  )}
                </div>
              </form>

              <hr style={{ borderColor: '#1e293b', margin: '20px 0' }} />
              <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Добавить услугу или штраф:</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 90px 40px', gap: '8px', marginBottom: '12px' }}>
                <select value={extraCategory} onChange={e => setExtraCategory(e.target.value)} style={{ padding: '8px', backgroundColor: '#070b14', border: '1px solid #1e293b', color: '#fff', borderRadius: '8px', fontSize: '11px' }}>
                  <option value="Штраф">Штраф</option>
                  <option value="Стирка">Стирка</option>
                  <option value="Трансфер">Трансфер</option>
                  <option value="Услуга">Услуга</option>
                </select>
                <input type="text" placeholder="Название" value={extraName} onChange={e => setExtraName(e.target.value)} style={{ padding: '8px 10px', backgroundColor: '#070b14', border: '1px solid #1e293b', color: '#fff', borderRadius: '8px' }} />
                <input type="number" placeholder="KGS" value={extraPrice} onChange={e => setExtraPrice(e.target.value)} style={{ padding: '8px 10px', backgroundColor: '#070b14', border: '1px solid #1e293b', color: '#fff', borderRadius: '8px' }} />
                <button type="button" onClick={addExtraService} style={{ backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>+</button>
              </div>
              {selectedBed.services && selectedBed.services.map((s, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '4px', borderBottom: '1px solid #1e293b', marginBottom: '4px' }}>
                  <span>{s.name} — <strong style={{ color: '#fbbf24' }}>{s.price} KGS</strong></span>
                  <button onClick={() => removeService(idx)} style={{ backgroundColor: '#7f1d1d', color: '#fca5a5', border: 'none', padding: '2px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' }}>✕</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showInvoiceModal && selectedBed && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
          <div style={{ backgroundColor: '#fff', color: '#000', width: '480px', padding: '32px', borderRadius: '12px' }}>
            <h2 style={{ textAlign: 'center', margin: '0 0 10px 0' }}>{hotelName}</h2>
            <p><strong>Гость:</strong> {selectedBed.guest}</p>
            <p><strong>Телефон:</strong> {selectedBed.phone}</p>
            <p><strong>Размещение:</strong> {selectedRoom.name} — {selectedBed.name} ({selectedBed.nights} ноч.)</p>
            <hr />
            <p style={{ fontWeight: 'bold' }}>Итого к оплате: {(selectedRoom.price * (selectedBed.nights || 1)) + selectedBed.services.reduce((a, c) => a + c.price, 0)} KGS</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => window.print()} style={{ flex: 1, backgroundColor: '#000', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer' }}>Печать чека</button>
              <button onClick={() => setShowInvoiceModal(false)} style={{ backgroundColor: '#ccc', border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer' }}>Закрыть</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}