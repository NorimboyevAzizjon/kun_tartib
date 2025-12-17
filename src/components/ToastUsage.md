// How to use the Toast notification system in KunTartib

// 1. From any React component:
//    import { useContext } from 'react';
//    import { ToastContext } from '../App';
//    ...
//    const { showToast } = useContext(ToastContext);
//    showToast('Xabar matni', 'success'); // types: info, success, error, warning

// 2. From anywhere (even outside React):
//    window.dispatchEvent(new CustomEvent('kuntartib-toast', {
//      detail: { message: 'Xabar matni', type: 'error', duration: 4000 }
//    }));

// Example usage in a component:
//   showToast('Muvaffaqiyatli saqlandi!', 'success');

// Example usage globally:
//   window.dispatchEvent(new CustomEvent('kuntartib-toast', { detail: { message: 'Xatolik yuz berdi', type: 'error' } }));

// The Toast will appear at the bottom center and auto-dismiss after the specified duration.
