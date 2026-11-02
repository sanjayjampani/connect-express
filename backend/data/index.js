// Stations for Tamil Nadu, Karnataka, and Andhra Pradesh
const stations = [
  // Tamil Nadu (TN)
  { code: 'MAS', name: 'Chennai Central', state: 'TN' },
  { code: 'MS', name: 'Chennai Egmore', state: 'TN' },
  { code: 'TBM', name: 'Tambaram', state: 'TN' },
  { code: 'CBE', name: 'Coimbatore Junction', state: 'TN' },
  { code: 'MDU', name: 'Madurai Junction', state: 'TN' },
  { code: 'TPJ', name: 'Tiruchirappalli Junction', state: 'TN' },
  { code: 'SA', name: 'Salem Junction', state: 'TN' },
  { code: 'ED', name: 'Erode Junction', state: 'TN' },
  { code: 'KPD', name: 'Katpadi Junction', state: 'TN' },
  { code: 'JTJ', name: 'Jolarpettai Junction', state: 'TN' },
  { code: 'VRI', name: 'Vellore', state: 'TN' },
  { code: 'AJJ', name: 'Arakkonam Junction', state: 'TN' },
  { code: 'RU', name: 'Renigunta Junction', state: 'TN' },
  { code: 'TEN', name: 'Tirunelveli Junction', state: 'TN' },
  { code: 'NCJ', name: 'Nagercoil Junction', state: 'TN' },
  { code: 'TUP', name: 'Tirupur', state: 'TN' },
  { code: 'CGL', name: 'Chengalpattu Junction', state: 'TN' },
  { code: 'VM', name: 'Villupuram Junction', state: 'TN' },
  { code: 'KNR', name: 'Karur Junction', state: 'TN' },
  { code: 'DG', name: 'Dindigul Junction', state: 'TN' },

  // Karnataka (KA)
  { code: 'SBC', name: 'Bengaluru City Junction', state: 'KA' },
  { code: 'YPR', name: 'Yesvantpur Junction', state: 'KA' },
  { code: 'KSR', name: 'Bengaluru Cantt', state: 'KA' },
  { code: 'MYS', name: 'Mysuru Junction', state: 'KA' },
  { code: 'UBL', name: 'Hubli Junction', state: 'KA' },
  { code: 'GDG', name: 'Gadag Junction', state: 'KA' },
  { code: 'DWR', name: 'Dharwad', state: 'KA' },
  { code: 'BJP', name: 'Bijapur', state: 'KA' },
  { code: 'BGK', name: 'Bagalkot', state: 'KA' },
  { code: 'BLY', name: 'Ballari Junction', state: 'KA' },
  { code: 'GTL', name: 'Guntakal Junction', state: 'KA' },
  { code: 'MAQ', name: 'Mangaluru Central', state: 'KA' },
  { code: 'MAJN', name: 'Mangaluru Junction', state: 'KA' },
  { code: 'UD', name: 'Udupi', state: 'KA' },
  { code: 'ASK', name: 'Arsikere Junction', state: 'KA' },
  { code: 'HAS', name: 'Hassan', state: 'KA' },
  { code: 'BAND', name: 'Bangarpet', state: 'KA' },
  { code: 'KPN', name: 'Krishnarajapuram', state: 'KA' },

  // Andhra Pradesh (AP)
  { code: 'BZA', name: 'Vijayawada Junction', state: 'AP' },
  { code: 'VSKP', name: 'Visakhapatnam', state: 'AP' },
  { code: 'GNT', name: 'Guntur Junction', state: 'AP' },
  { code: 'OGL', name: 'Ongole', state: 'AP' },
  { code: 'NLR', name: 'Nellore', state: 'AP' },
  { code: 'GDR', name: 'Gudur Junction', state: 'AP' },
  { code: 'RJY', name: 'Rajahmundry', state: 'AP' },
  { code: 'TPTY', name: 'Tirupati Main', state: 'AP' },
  { code: 'NDL', name: 'Nandyal', state: 'AP' },
  { code: 'KDP', name: 'Kadapa', state: 'AP' },
  { code: 'ATP', name: 'Anantapur', state: 'AP' },
  { code: 'DMM', name: 'Dharmavaram Junction', state: 'AP' },
  { code: 'KRNT', name: 'Kurnool Town', state: 'AP' },
  { code: 'EE', name: 'Eluru', state: 'AP' },
  { code: 'TNP', name: 'Tenali Junction', state: 'AP' },
  { code: 'CLX', name: 'Chirala', state: 'AP' },
  { code: 'KVZ', name: 'Kavali', state: 'AP' },
  { code: 'SLO', name: 'Samalkot Junction', state: 'AP' },
  { code: 'BPP', name: 'Bhimavaram Town', state: 'AP' },
  { code: 'NLPD', name: 'Narasapur', state: 'AP' }
];

// Train routes connecting major stations
const routes = [
  // Chennai-Bangalore corridor
  ['MAS', 'AJJ', 'KPD', 'JTJ', 'BAND', 'SBC'],
  ['MAS', 'AJJ', 'KPD', 'JTJ', 'SBC'],
  ['MS', 'CGL', 'KPD', 'SBC'],
  ['MAS', 'KPD', 'SBC', 'YPR'],
  
  // Chennai-Coimbatore corridor
  ['MAS', 'AJJ', 'KPD', 'JTJ', 'SA', 'ED', 'CBE'],
  ['MS', 'VM', 'SA', 'ED', 'TUP', 'CBE'],
  ['MAS', 'SA', 'ED', 'CBE'],
  
  // Chennai-Vijayawada corridor
  ['MAS', 'GDR', 'NLR', 'OGL', 'TNP', 'BZA'],
  ['MAS', 'NLR', 'OGL', 'GNT', 'BZA'],
  ['MAS', 'GDR', 'OGL', 'BZA', 'RJY', 'VSKP'],
  
  // Chennai-Tirupati corridor
  ['MAS', 'AJJ', 'RU', 'TPTY'],
  ['MAS', 'GDR', 'RU', 'TPTY'],
  ['MAS', 'CGL', 'GDR', 'TPTY'],
  
  // Bangalore-Mysore corridor
  ['SBC', 'MYS'],
  ['YPR', 'SBC', 'MYS'],
  ['SBC', 'KPN', 'MYS'],
  
  // Bangalore-Hubli corridor
  ['SBC', 'ASK', 'DWR', 'UBL'],
  ['YPR', 'ASK', 'GDG', 'UBL'],
  ['SBC', 'GTL', 'UBL'],
  
  // Bangalore-Mangalore corridor
  ['SBC', 'ASK', 'HAS', 'MAQ'],
  ['YPR', 'HAS', 'MAJN', 'MAQ'],
  ['SBC', 'MYS', 'HAS', 'MAQ'],
  
  // Vijayawada-Tirupati corridor
  ['BZA', 'GNT', 'OGL', 'NLR', 'GDR', 'TPTY'],
  ['BZA', 'TNP', 'OGL', 'GDR', 'RU', 'TPTY'],
  
  // Tirupati-Bangalore corridor
  ['TPTY', 'RU', 'KPD', 'JTJ', 'SBC'],
  ['TPTY', 'RU', 'JTJ', 'BAND', 'SBC'],
  
  // Chennai-Madurai corridor
  ['MS', 'VM', 'TPJ', 'DG', 'MDU'],
  ['MAS', 'TPJ', 'KNR', 'DG', 'MDU'],
  ['MAS', 'SA', 'KNR', 'TPJ', 'MDU'],
  
  // Madurai-Tirunelveli corridor
  ['MDU', 'TEN', 'NCJ'],
  ['MDU', 'DG', 'TEN'],
  
  // Cross-state routes
  ['VSKP', 'RJY', 'BZA', 'GNT', 'GTL', 'SBC'],
  ['MAS', 'KPD', 'GTL', 'UBL'],
  ['CBE', 'SA', 'JTJ', 'KPD', 'RU', 'TPTY'],
  ['MDU', 'TPJ', 'SA', 'KPD', 'SBC'],
  ['MAQ', 'HAS', 'MYS', 'SBC', 'BAND', 'JTJ', 'KPD', 'MAS'],
  ['TEN', 'MDU', 'DG', 'TPJ', 'SA', 'ED', 'CBE'],
  ['VSKP', 'BZA', 'GTL', 'DMM', 'ATP', 'SBC'],
  ['NCJ', 'TEN', 'MDU', 'TPJ', 'MAS'],
  ['UBL', 'GDG', 'GTL', 'TPTY', 'RU', 'MAS'],
  ['CBE', 'ED', 'SA', 'JTJ', 'SBC', 'YPR'],
  ['MAS', 'NLR', 'KRNT', 'GTL', 'UBL'],
  ['VSKP', 'RJY', 'EE', 'BZA', 'GNT', 'OGL', 'NLR', 'MAS'],
  
  // Additional junction heavy routes
  ['SBC', 'GTL', 'GNT', 'BZA'],
  ['MYS', 'SBC', 'JTJ', 'KPD', 'TPTY'],
  ['MAQ', 'SBC', 'KPD', 'MAS'],
  ['CBE', 'SA', 'MAS'],
  ['UBL', 'GTL', 'GDR', 'MAS'],
  ['MDU', 'CBE', 'MYS', 'SBC'],
  ['VSKP', 'BZA', 'MAS'],
  ['NCJ', 'MDU', 'CBE', 'SBC'],
  ['TPTY', 'GTL', 'SBC'],
  ['TPTY', 'BZA', 'VSKP']
];

module.exports = { stations, routes };
