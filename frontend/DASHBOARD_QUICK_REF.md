# Dashboard Setup - Quick Reference

## 🚀 Quick Start

### Access the Dashboards
1. **User Dashboard**: `/dashboard` (after login)
   - Auto-redirects if not authenticated
   - Shows personal stats and orders
   
2. **Admin Dashboard**: `/admin-dashboard` (admin users only)
   - Shows store stats and management tools

### Navigation
- Click your avatar in navbar → Select "Dashboard"
- Or remember the routes directly

## 📦 Files Created

### Pages
```
frontend/src/pages/
├── Dashboard.jsx           (User dashboard - main file)
└── AdminDashboard.jsx      (Admin dashboard)
```

### Components
```
frontend/src/components/
├── DashboardCard.jsx       (Reusable stat card)
├── StatsGrid.jsx           (Stats grid container)
├── OrderCard.jsx           (Individual order display)
└── SectionCard.jsx         (Section wrapper)
```

### Documentation
```
frontend/
├── DASHBOARD_GUIDE.md      (Comprehensive guide)
└── DASHBOARD_QUICK_REF.md  (This file)
```

## 🎨 Styling Stack

| Tool | Purpose |
|------|---------|
| Tailwind CSS | Core styling |
| DaisyUI | Pre-built components |
| Lucide React | Icons (30+ used) |
| Framer Motion | Animations |

## 💡 Key Features

### Dashboard Features
- ✅ Welcome header with logout
- ✅ 4-stat dashboard cards
- ✅ Recent orders list
- ✅ User profile card
- ✅ Quick action buttons
- ✅ Pro tips section
- ✅ Loading/error states
- ✅ Responsive mobile layout
- ✅ Smooth animations
- ✅ Empty state messaging

### Component Reusability
```jsx
// Use DashboardCard
<DashboardCard
  title="Total Orders"
  value={5}
  Icon={ShoppingBag}
  color="blue"
  subtitle="All time"
/>

// Use StatsGrid
<StatsGrid stats={[...]} />

// Use OrderCard
<OrderCard order={order} onViewDetails={handleClick} />

// Use SectionCard
<SectionCard title="Orders" icon={Package}>
  {/* content */}
</SectionCard>
```

## 🔄 Data Flow

```
User Login
    ↓
PrivateRouter Check
    ↓
Dashboard Page Load
    ↓
Fetch Orders API
    ↓
Calculate Statistics
    ↓
Render Components with Animations
    ↓
User Interactions (Click, Navigate)
```

## 🎯 Customization Examples

### Change Color Theme
```jsx
// In any DashboardCard
color="green"  // Change from blue to green
// Options: blue, green, purple, orange, red, indigo
```

### Add New Stat Card
```jsx
{
  title: "New Metric",
  value: data.value,
  icon: NewIcon,
  color: "blue",
  subtitle: "Description"
}
```

### Adjust Animation Speed
```jsx
// In container variants
staggerChildren: 0.1,   // Delay between items
delayChildren: 0.2,      // Initial delay
transition: { duration: 0.5 }  // Item duration
```

## ✨ Animation Details

### Page Load
- Fade in + slide up
- Staggered children (0.1s apart)
- Total duration ~2-3 seconds

### Interactions
- Button hover: scale 1.05
- Button click: scale 0.95
- Card hover: shadow increase
- Link hover: translate right

## 📊 API Endpoints Used

| Endpoint | Purpose |
|----------|---------|
| `/api/orders/` | Fetch user orders |
| `/api/products/` | Fetch products (admin) |
| `/api/categories/` | Fetch categories (navbar) |

## 🔐 Authentication

- Dashboards protected by `PrivateRouter`
- Uses `authFetch` for authenticated requests
- Auto-redirects to login if not authenticated
- Admin dashboard checks user role

## 📱 Responsive Behavior

| Viewport | Layout |
|----------|--------|
| Mobile (< 768px) | 1 column, stacked full-width |
| Tablet (768px+) | 2-3 columns, sidebar right |
| Desktop (1024px+) | 4-column grid + 3-column sidebar |

## 🐛 Common Issues & Fixes

### Dashboard not showing
- ✅ Verify login (`/login` first)
- ✅ Check route in `App.jsx`
- ✅ Browser refresh (Ctrl+Shift+R)

### Styles not applying
- ✅ Rebuild Tailwind CSS
- ✅ Verify DaisyUI plugin in tailwind config
- ✅ Clear browser cache

### Icons not showing
- ✅ Verify `npm install lucide-react`
- ✅ Check icon imports correct
- ✅ Restart dev server

### API errors
- ✅ Check `VITE_DJANGO_BASE_URL` in `.env`
- ✅ Verify backend is running
- ✅ Check CORS configuration
- ✅ Verify auth token validity

## 📈 Performance Tips

- ✅ Use lazy loading for images
- ✅ Memoize components if needed
- ✅ Optimize API calls
- ✅ Use proper React keys
- ✅ Monitor bundle size

## 🎓 Learning Resources

- [Tailwind CSS Docs](https://tailwindcss.com/)
- [DaisyUI Components](https://daisyui.com/)
- [Lucide Icons](https://lucide.dev/)
- [Framer Motion](https://www.framer.com/motion/)

## ✅ Testing Checklist

- [ ] Dashboard loads without errors
- [ ] Stats display correctly
- [ ] Orders load and display
- [ ] Profile info shows
- [ ] Quick action buttons work
- [ ] Animations play smoothly
- [ ] Mobile layout responsive
- [ ] Error states display
- [ ] Loading spinner shows
- [ ] Icons render properly
- [ ] Colors match design
- [ ] Links navigate correctly

## 🚀 Next Enhancement Ideas

1. **Charts & Analytics**
   - Order trends graph
   - Revenue chart
   - Customer growth

2. **Real-time Updates**
   - WebSocket integration
   - Live order notifications
   - Stock updates

3. **Advanced Features**
   - Data export (CSV, PDF)
   - Custom date ranges
   - Advanced filtering
   - Search functionality

4. **Mobile App**
   - Native app version
   - Push notifications
   - Offline capability

## 📞 Support

For issues or questions:
1. Check `DASHBOARD_GUIDE.md` for detailed info
2. Review component examples in this file
3. Check browser console for errors
4. Verify backend API responses

---

**Version**: 1.0  
**Last Updated**: 2024  
**Status**: Production Ready  
**Maintained By**: Development Team
