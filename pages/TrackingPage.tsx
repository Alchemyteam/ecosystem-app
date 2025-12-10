import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import {
  Home,
  Package,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  User,
  HelpCircle,
  FileText,
  Heart,
  ShoppingCart,
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
  Navigation,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';

interface TrackingLocation {
  lat: number;
  lng: number;
  timestamp: string;
  status: string;
  description: string;
}

interface TrackingEvent {
  id: string;
  status: string;
  description: string;
  timestamp: string;
  location?: string;
}

interface TrackingOrder {
  orderId: string;
  orderNumber: string;
  trackingNumber: string;
  status: 'pending' | 'processing' | 'in_transit' | 'out_for_delivery' | 'delivered';
  currentLocation: TrackingLocation;
  origin: { lat: number; lng: number; address: string };
  destination: { lat: number; lng: number; address: string };
  events: TrackingEvent[];
  estimatedDelivery: string;
  carrier?: string;
}

// MapView 组件 - 放在 TrackingPage 外面
interface MapViewProps {
  order: TrackingOrder;
  isRefreshing: boolean;
  onRefresh: () => void;
  formatTime: (dateString: string) => string;
}

const MapView: React.FC<MapViewProps> = ({ order, isRefreshing, onRefresh, formatTime }) => {
  const mapContainerRef = React.useRef<HTMLDivElement>(null);
  const mapInstanceRef = React.useRef<any>(null);
  const markersRef = React.useRef<any[]>([]);
  const polylinesRef = React.useRef<any[]>([]);
  const zoomRef = React.useRef<number>(12);
  const [mapLoaded, setMapLoaded] = useState(false);

  // 等待 AMap 加载
  useEffect(() => {
    const checkAMapLoaded = () => {
      if (typeof window !== 'undefined' && (window as any).AMap) {
        setMapLoaded(true);
      } else {
        setTimeout(checkAMapLoaded, 100);
      }
    };
    checkAMapLoaded();
  }, []);

  // 地图只初始化一次
  useEffect(() => {
    if (!mapContainerRef.current || !mapLoaded || mapInstanceRef.current) return;

    const AMap = (window as any).AMap;
    if (!AMap) {
      console.error('Gaode Map API not loaded');
      return;
    }

    const centerLng = (order.origin.lng + order.destination.lng) / 2;
    const centerLat = (order.origin.lat + order.destination.lat) / 2;

    console.log('Initializing map, center:', [centerLng, centerLat]);
    console.log('Origin:', [order.origin.lng, order.origin.lat]);
    console.log('Destination:', [order.destination.lng, order.destination.lat]);
    console.log('Current location:', [order.currentLocation.lng, order.currentLocation.lat]);

    const map = new AMap.Map(mapContainerRef.current, {
      zoom: zoomRef.current,
      center: [centerLng, centerLat],
      mapStyle: 'amap://styles/normal',
      viewMode: '2D', // 使用2D视图
    });

    mapInstanceRef.current = map;

    // 监听地图加载完成事件
    map.on('complete', () => {
      console.log('Map loaded');
      // 初始化覆盖物
      if (mapInstanceRef.current) {
        updateMapOverlays(order);
      }
    });

    map.on('zoomchange', () => {
      zoomRef.current = map.getZoom();
    });

    // 初始化时设一次 bounds
    setTimeout(() => {
      if (mapInstanceRef.current) {
        const bounds = new AMap.Bounds(
          new AMap.LngLat(order.origin.lng, order.origin.lat),
          new AMap.LngLat(order.destination.lng, order.destination.lat)
        );
        map.setBounds(bounds, false, [50, 50, 50, 50]);
        console.log('Setting map bounds');
      }
    }, 500);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
      }
    };
  }, [mapLoaded]); // ✅ 只看 mapLoaded，不看 order

  const createSVGDataURI = (svgString: string): string =>
    'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);

  const clearMapOverlays = () => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    markersRef.current.forEach((m) => map.remove(m));
    polylinesRef.current.forEach((p) => map.remove(p));
    markersRef.current = [];
    polylinesRef.current = [];
  };

  const updateMapOverlays = (order: TrackingOrder) => {
    if (!mapInstanceRef.current) {
      console.warn('Map instance does not exist, cannot update overlays');
      return;
    }

    const AMap = (window as any).AMap;
    const map = mapInstanceRef.current;

    console.log('Updating map overlays, order ID:', order.orderId);
    clearMapOverlays();

    const originMarker = new AMap.Marker({
      position: [order.origin.lng, order.origin.lat],
      icon: new AMap.Icon({
        size: new AMap.Size(40, 40), // 增大图标尺寸
        image: createSVGDataURI(`
          <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="16" fill="#10b981" stroke="white" stroke-width="3"/>
            <text x="20" y="25" font-size="12" fill="white" text-anchor="middle" font-weight="bold">O</text>
          </svg>
        `),
        imageSize: new AMap.Size(40, 40),
      }),
      title: 'Origin',
      offset: new AMap.Pixel(-20, -20),
      zIndex: 100, // 设置层级
    });

    const destMarker = new AMap.Marker({
      position: [order.destination.lng, order.destination.lat],
      icon: new AMap.Icon({
        size: new AMap.Size(40, 40), // 增大图标尺寸
        image: createSVGDataURI(`
          <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="16" fill="#ef4444" stroke="white" stroke-width="3"/>
            <text x="20" y="25" font-size="12" fill="white" text-anchor="middle" font-weight="bold">D</text>
          </svg>
        `),
        imageSize: new AMap.Size(40, 40),
      }),
      title: 'Destination',
      offset: new AMap.Pixel(-20, -20),
      zIndex: 100, // 设置层级
    });

    const currentMarker = new AMap.Marker({
      position: [order.currentLocation.lng, order.currentLocation.lat],
      icon: new AMap.Icon({
        size: new AMap.Size(50, 50), // 增大图标尺寸，更容易看到
        image: createSVGDataURI(`
          <svg width="50" height="50" xmlns="http://www.w3.org/2000/svg">
            <circle cx="25" cy="25" r="20" fill="#6366f1" fill-opacity="0.3"/>
            <circle cx="25" cy="25" r="15" fill="#6366f1" fill-opacity="0.5"/>
            <circle cx="25" cy="25" r="10" fill="#6366f1" stroke="white" stroke-width="3"/>
          </svg>
        `),
        imageSize: new AMap.Size(50, 50),
      }),
      title: 'Current Location',
      offset: new AMap.Pixel(-25, -25),
      zIndex: 1000, // 确保在最上层
    });

    const route = new AMap.Polyline({
      path: [
        [order.origin.lng, order.origin.lat],
        [order.destination.lng, order.destination.lat],
      ],
      strokeColor: '#6366f1',
      strokeWeight: 4,
      lineJoin: 'round',
      strokeStyle: 'solid',
    });

    map.add([originMarker, destMarker, currentMarker, route]);
    markersRef.current = [originMarker, destMarker, currentMarker];
    polylinesRef.current = [route];
    
    console.log('Markers and route added to map:', {
      markers: markersRef.current.length,
      polylines: polylinesRef.current.length,
      origin: [order.origin.lng, order.origin.lat],
      destination: [order.destination.lng, order.destination.lat],
      current: [order.currentLocation.lng, order.currentLocation.lat],
    });

    // 添加信息窗口
    originMarker.on('click', () => {
      const infoWindow = new AMap.InfoWindow({
        content: `<div style="padding: 8px;"><strong>Origin</strong><br/>${order.origin.address}</div>`,
        offset: new AMap.Pixel(0, -30),
      });
      infoWindow.open(map, originMarker.getPosition());
    });

    destMarker.on('click', () => {
      const infoWindow = new AMap.InfoWindow({
        content: `<div style="padding: 8px;"><strong>Destination</strong><br/>${order.destination.address}</div>`,
        offset: new AMap.Pixel(0, -30),
      });
      infoWindow.open(map, destMarker.getPosition());
    });

    currentMarker.on('click', () => {
      const infoWindow = new AMap.InfoWindow({
        content: `<div style="padding: 8px;"><strong>Current Location</strong><br/>${order.currentLocation.description}<br/><small>${formatTime(order.currentLocation.timestamp)}</small></div>`,
        offset: new AMap.Pixel(0, -30),
      });
      infoWindow.open(map, currentMarker.getPosition());
    });
  };

  // 👉 订单变了：更新覆盖物，但不改缩放级别
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    updateMapOverlays(order);
    // 如果你希望切换订单时平移到新的中心，但保持 zoom：
    // const map = mapInstanceRef.current;
    // const centerLng = (order.origin.lng + order.destination.lng) / 2;
    // const centerLat = (order.origin.lat + order.destination.lat) / 2;
    // map.setCenter([centerLng, centerLat]); // 不调用 setFitView / setZoom
  }, [order.orderId, order.origin.lng, order.origin.lat, order.destination.lng, order.destination.lat]);

  // 👉 实时位置更新：只动当前位置 marker
  useEffect(() => {
    if (!mapInstanceRef.current || markersRef.current.length < 3) return;

    const currentMarker = markersRef.current[2];
    currentMarker.setPosition([order.currentLocation.lng, order.currentLocation.lat]);
  }, [order.currentLocation.lat, order.currentLocation.lng]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Real-time Location Tracking</h3>
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>
      <div
        ref={mapContainerRef}
        className="w-full rounded-lg overflow-hidden bg-slate-100 relative"
        style={{ height: '500px', minHeight: '500px' }}
      >
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100 z-10">
            <div className="text-center">
              <RefreshCw className="animate-spin mx-auto mb-2 text-slate-400" size={24} />
              <p className="text-sm text-slate-500">Loading map...</p>
            </div>
          </div>
        )}
        {mapLoaded && !mapInstanceRef.current && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100 z-10">
            <div className="text-center">
              <RefreshCw className="animate-spin mx-auto mb-2 text-slate-400" size={24} />
              <p className="text-sm text-slate-500">Initializing map...</p>
            </div>
          </div>
        )}
      </div>
      {mapLoaded && mapInstanceRef.current && (
        <div className="mt-2 text-xs text-slate-500 text-center">
          💡 Note: Gaode Map may not have detailed map data in Singapore, but markers and routes will still be displayed
        </div>
      )}
      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-slate-500 mb-1">Origin</p>
          <p className="font-medium text-slate-900">{order.origin.address}</p>
        </div>
        <div>
          <p className="text-slate-500 mb-1">Current Location</p>
          <p className="font-medium text-slate-900">{order.currentLocation.description}</p>
          <p className="text-xs text-slate-500 mt-1">{formatTime(order.currentLocation.timestamp)}</p>
        </div>
        <div>
          <p className="text-slate-500 mb-1">Destination</p>
          <p className="font-medium text-slate-900">{order.destination.address}</p>
        </div>
      </div>
    </div>
  );
};

const TrackingPage: React.FC = () => {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId?: string }>();
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set(['products', 'orders', 'favorites', 'account']));
  const [selectedOrderId, setSelectedOrderId] = useState<string | undefined>(orderId);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 初始模拟数据 - 使用新加坡真实地址
  const initialTrackingOrders: TrackingOrder[] = [
    {
      orderId: '1',
      orderNumber: 'ORD-2024-001',
      trackingNumber: 'TRK123456789',
      status: 'in_transit',
      currentLocation: {
        lat: 1.3100,
        lng: 103.8400,
        timestamp: new Date().toISOString(),
        status: 'in_transit',
        description: 'En route to distribution center',
      },
      origin: {
        lat: 1.290270,
        lng: 103.851959,
        address: 'Jurong Port, Jurong Island, Singapore 628130',
      },
      destination: {
        lat: 1.3048,
        lng: 103.8318,
        address: '391 Orchard Road, Singapore 238873',
      },
      events: [
        {
          id: '1',
          status: 'processing',
          description: 'Order confirmed, processing',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          location: 'Jurong Port Warehouse',
        },
        {
          id: '2',
          status: 'processing',
          description: 'Package ready for shipment',
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          location: 'Jurong Port Warehouse',
        },
        {
          id: '3',
          status: 'in_transit',
          description: 'Package picked up by carrier',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          location: 'Jurong Port',
        },
        {
          id: '4',
          status: 'in_transit',
          description: 'En route to distribution center',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          location: 'In transit',
        },
      ],
      estimatedDelivery: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      carrier: 'Express Logistics',
    },
    {
      orderId: '2',
      orderNumber: 'ORD-2024-002',
      trackingNumber: 'TRK987654321',
      status: 'out_for_delivery',
      currentLocation: {
        lat: 1.3020,
        lng: 103.8350,
        timestamp: new Date().toISOString(),
        status: 'out_for_delivery',
        description: 'Out for delivery',
      },
      origin: {
        lat: 1.2819,
        lng: 103.8604,
        address: 'Marina Bay Distribution Center, Singapore 018956',
      },
      destination: {
        lat: 1.3526,
        lng: 103.9442,
        address: '1 Tampines Central 1, Tampines, Singapore 529508',
      },
      events: [
        {
          id: '1',
          status: 'processing',
          description: 'Order confirmed',
          timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
          location: 'Marina Bay Distribution Center',
        },
        {
          id: '2',
          status: 'in_transit',
          description: 'Package in transit',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          location: 'Distribution Center',
        },
        {
          id: '3',
          status: 'out_for_delivery',
          description: 'Out for delivery',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          location: 'Delivery Vehicle',
        },
      ],
      estimatedDelivery: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
      carrier: 'Fast Delivery Co.',
    },
    {
      orderId: '3',
      orderNumber: 'ORD-2024-003',
      trackingNumber: 'TRK456789123',
      status: 'in_transit',
      currentLocation: {
        lat: 1.3644,
        lng: 103.9915,
        timestamp: new Date().toISOString(),
        status: 'in_transit',
        description: 'En route to destination',
      },
      origin: {
        lat: 1.3644,
        lng: 103.9915,
        address: 'Changi Airport Cargo Terminal, Singapore 819643',
      },
      destination: {
        lat: 1.2494,
        lng: 103.8303,
        address: 'Sentosa Gateway, Sentosa Island, Singapore 098269',
      },
      events: [
        {
          id: '1',
          status: 'processing',
          description: 'Order confirmed',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          location: 'Changi Airport Cargo Terminal',
        },
        {
          id: '2',
          status: 'in_transit',
          description: 'Package dispatched from airport',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          location: 'Changi Airport',
        },
        {
          id: '3',
          status: 'in_transit',
          description: 'En route to destination',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          location: 'In transit',
        },
      ],
      estimatedDelivery: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
      carrier: 'Airport Express',
    },
  ];

  // 使用 state 存储可变的订单数据
  const [trackingOrders, setTrackingOrders] = useState<TrackingOrder[]>(initialTrackingOrders);
  
  const currentOrder = selectedOrderId
    ? trackingOrders.find((o) => o.orderId === selectedOrderId)
    : trackingOrders[0];

  // 实时位置更新 - 模拟车辆移动
  useEffect(() => {
    if (!currentOrder || currentOrder.status === 'delivered') return;

    const updateLocation = () => {
      setTrackingOrders((prevOrders) => {
        return prevOrders.map((order) => {
          if (order.orderId !== currentOrder.orderId) return order;
          if (order.status === 'delivered') return order;

          // Calculate progress from origin to destination (0-1)
          const totalDistance = Math.sqrt(
            Math.pow(order.destination.lng - order.origin.lng, 2) +
            Math.pow(order.destination.lat - order.origin.lat, 2)
          );
          const currentDistance = Math.sqrt(
            Math.pow(order.currentLocation.lng - order.origin.lng, 2) +
            Math.pow(order.currentLocation.lat - order.origin.lat, 2)
          );
          let progress = currentDistance / totalDistance;

          // Adjust progress based on status - increase movement step size to make changes more noticeable
          if (order.status === 'out_for_delivery') {
            progress = Math.min(progress + 0.02 + Math.random() * 0.03, 0.98); // Approaching destination, move 2-5% each time
          } else if (order.status === 'in_transit') {
            progress = Math.min(progress + 0.03 + Math.random() * 0.04, 0.85); // Gradually advancing, move 3-7% each time
          } else {
            progress = Math.min(progress + 0.02 + Math.random() * 0.03, 0.4); // Other statuses, move 2-5% each time
          }

          // Calculate new position (moving along a straight line from origin to destination)
          const newLng = order.origin.lng + (order.destination.lng - order.origin.lng) * progress;
          const newLat = order.origin.lat + (order.destination.lat - order.origin.lat) * progress;

          // Add random offset to make changes more noticeable, simulating real roads
          const randomOffset = 0.003; // Increased from 0.001 to 0.003 to make offset more noticeable
          const offsetLng = newLng + (Math.random() - 0.5) * randomOffset;
          const offsetLat = newLat + (Math.random() - 0.5) * randomOffset;

          // Update description
          let description = 'In transit';
          if (progress > 0.9) {
            description = 'Arriving soon';
          } else if (progress > 0.7) {
            description = 'Approaching destination';
          } else if (progress > 0.4) {
            description = 'En route to distribution center';
          }

          return {
            ...order,
            currentLocation: {
              lat: offsetLat,
              lng: offsetLng,
              timestamp: new Date().toISOString(),
              status: order.status,
              description: description,
            },
          };
        });
      });
    };

    // Update position every 2 seconds
    const interval = setInterval(updateLocation, 2000);
    
    // Execute immediately once
    updateLocation();

    return () => clearInterval(interval);
  }, [currentOrder?.orderId, currentOrder?.status]);

  const toggleMenu = (menuKey: string) => {
    setExpandedMenus((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(menuKey)) {
        newSet.delete(menuKey);
      } else {
        newSet.add(menuKey);
      }
      return newSet;
    });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: TrackingOrder['status']) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'out_for_delivery':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'in_transit':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'processing':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'pending':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusLabel = (status: TrackingOrder['status']) => {
    const labels: Record<TrackingOrder['status'], string> = {
      pending: 'Pending',
      processing: 'Processing',
      in_transit: 'In Transit',
      out_for_delivery: 'Out for Delivery',
      delivered: 'Delivered',
    };
    return labels[status] || status;
  };

  // Calculate progress percentage
  const calculateProgress = (order: TrackingOrder) => {
    if (order.status === 'delivered') return 100;
    if (order.status === 'out_for_delivery') return 85;
    if (order.status === 'in_transit') return 60;
    if (order.status === 'processing') return 30;
    return 10;
  };

  if (!currentOrder) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        <Header />
        <main className="pt-20 flex items-center justify-center h-screen">
          <div className="text-center">
            <Package className="mx-auto text-slate-400 mb-4" size={64} />
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">Order Not Found</h2>
            <p className="text-slate-600 mb-6">Please select another order to track</p>
            <Link
              to="/buyer/orders"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors"
            >
              <ArrowRight size={18} />
              Back to Orders
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Header />
      <main className="pt-20 flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 h-full overflow-y-auto">
          <nav className="p-4 space-y-1">
            {/* Home */}
            <Link
              to="/"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-brand-600 transition-colors"
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">Home</span>
            </Link>

            {/* Products */}
            <div>
              <button
                onClick={() => toggleMenu('products')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-brand-600 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5" />
                  <span className="font-medium">Products</span>
                </div>
                {expandedMenus.has('products') ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
              {expandedMenus.has('products') && (
                <div className="ml-8 mt-1 space-y-1">
                  <Link
                    to="/buyer/products"
                    className="block px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 hover:text-brand-600 transition-colors"
                  >
                    All Products
                  </Link>
                  <Link
                    to="/buyer/ai-search"
                    className="block px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 hover:text-brand-600 transition-colors"
                  >
                    AI Search
                  </Link>
                  <Link
                    to="/buyer/price-insights"
                    className="block px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 hover:text-brand-600 transition-colors"
                  >
                    Price Insights
                  </Link>
                </div>
              )}
            </div>

            {/* Orders */}
            <div>
              <button
                onClick={() => toggleMenu('orders')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-brand-600 transition-colors bg-brand-50 text-brand-600"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5" />
                  <span className="font-medium">Orders</span>
                </div>
                {expandedMenus.has('orders') ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
              {expandedMenus.has('orders') && (
                <div className="ml-8 mt-1 space-y-1">
                  <Link
                    to="/buyer/orders"
                    className="block px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 hover:text-brand-600 transition-colors"
                  >
                    All Orders
                  </Link>
                  <Link
                    to="/buyer/tracking"
                    className="block px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 hover:text-brand-600 transition-colors bg-brand-50 text-brand-600"
                  >
                    Shipment Tracking
                  </Link>
                </div>
              )}
            </div>

            {/* Cart */}
            <Link
              to="/buyer/cart"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-brand-600 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="font-medium">Cart</span>
            </Link>

            {/* Favorites */}
            <div>
              <button
                onClick={() => toggleMenu('favorites')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-brand-600 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Heart className="w-5 h-5" />
                  <span className="font-medium">Favorites</span>
                </div>
                {expandedMenus.has('favorites') ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Messages */}
            <Link
              to="/buyer/messages"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-brand-600 transition-colors"
            >
              <MessageSquare className="w-5 h-5" />
              <span className="font-medium">Messages</span>
            </Link>

            {/* Account */}
            <div>
              <button
                onClick={() => toggleMenu('account')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-brand-600 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5" />
                  <span className="font-medium">Account</span>
                </div>
                {expandedMenus.has('account') ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Support */}
            <Link
              to="#"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-brand-600 transition-colors"
            >
              <HelpCircle className="w-5 h-5" />
              <span className="font-medium">Support</span>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Header */}
          <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10">
            <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
              <Link to="/buyer" className="hover:text-brand-600">
                Buyer Portal
              </Link>
              <span>/</span>
              <Link to="/buyer/orders" className="hover:text-brand-600">
                Orders
              </Link>
              <span>/</span>
              <span className="text-slate-900">Shipment Tracking</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Truck className="text-white" size={20} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Shipment Tracking</h1>
                  <p className="text-sm text-slate-600">Track your order delivery status in real-time</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 space-y-6">
            {/* Order Selector */}
            {trackingOrders.length > 1 && (
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">Select Order to Track</label>
                <select
                  value={selectedOrderId || ''}
                  onChange={(e) => {
                    setSelectedOrderId(e.target.value);
                    navigate(`/buyer/tracking/${e.target.value}`);
                  }}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                >
                  {trackingOrders.map((order) => (
                    <option key={order.orderId} value={order.orderId}>
                      {order.orderNumber} - {order.trackingNumber}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Order Info Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 mb-1">{currentOrder.orderNumber}</h2>
                  <p className="text-sm text-slate-600">Tracking Number: {currentOrder.trackingNumber}</p>
                  {currentOrder.carrier && (
                    <p className="text-sm text-slate-600">Carrier: {currentOrder.carrier}</p>
                  )}
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(currentOrder.status)}`}>
                  {getStatusLabel(currentOrder.status)}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
                  <span>Delivery Progress</span>
                  <span>{calculateProgress(currentOrder)}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${calculateProgress(currentOrder)}%` }}
                  />
                </div>
              </div>

              {/* Estimated Delivery */}
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Clock size={16} />
                <span>Estimated Delivery: {formatDateTime(currentOrder.estimatedDelivery)}</span>
              </div>
            </div>

            {/* Map View */}
            <MapView
              order={currentOrder}
              isRefreshing={isRefreshing}
              onRefresh={handleRefresh}
              formatTime={formatTime}
            />

            {/* Timeline */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Delivery Timeline</h3>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />
                <div className="space-y-6">
                  {currentOrder.events.map((event, index) => (
                    <div key={event.id} className="relative flex gap-4">
                      <div className="relative z-10">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            index === currentOrder.events.length - 1
                              ? 'bg-brand-600'
                              : 'bg-slate-300'
                          }`}
                        >
                          {event.status === 'delivered' ? (
                            <CheckCircle2 className="text-white" size={16} />
                          ) : (
                            <Clock className="text-white" size={16} />
                          )}
                        </div>
                      </div>
                      <div className="flex-1 pb-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-slate-900">{event.description}</p>
                            {event.location && (
                              <p className="text-sm text-slate-600 mt-1 flex items-center gap-1">
                                <MapPin size={14} />
                                {event.location}
                              </p>
                            )}
                          </div>
                          <p className="text-sm text-slate-500 whitespace-nowrap ml-4">
                            {formatDateTime(event.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TrackingPage;

