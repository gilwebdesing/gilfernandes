import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, Search, FileText, User, LogOut, LayoutDashboard, ChevronDown, MessageCircle, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { generateWhatsAppLink } from '@/lib/whatsapp'; // Import the WhatsApp utility

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const {
    user,
    broker,
    logout
  } = useAuth();
  const profileMenuRef = useRef(null);
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  useEffect(() => {
    setIsOpen(false);
    setIsProfileOpen(false);
  }, [location]);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
  };
  const handleWhatsAppClick = () => {
    window.open(generateWhatsAppLink(), '_blank');
  };
  const handlePhoneClick = () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      window.open(generateWhatsAppLink(), '_blank');
    } else {
      window.location.href = 'tel:5511971157373';
    }
  };
  return <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-lg' : 'bg-white/95 backdrop-blur-md'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-[#1a3a52] to-[#0d5a7a] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:rotate-3">
              <span className="text-white font-bold text-xl">SP</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-[#1a3a52] leading-none">Gil Fernandes Imóveis</span>
              <span className="text-xs text-[#ff8c42] font-semibold tracking-wider">PREMIUM</span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            
            {/* Phone Number Display */}
            <button onClick={handlePhoneClick} className="flex items-center gap-2 text-[#1a3a52] hover:text-[#ff8c42] font-medium transition-colors group" title="Fale Conosco">
              <div className="bg-[#1a3a52]/5 p-1.5 rounded-full group-hover:bg-[#ff8c42]/10 transition-colors">
                 <Phone className="w-4 h-4" />
              </div>
              <span>(11) 97115-7373</span>
            </button>

            <Link to="/" className="text-[#1a3a52] hover:text-[#ff8c42] font-medium transition-colors">Início</Link>
            <Link to="/imoveis" className="text-[#1a3a52] hover:text-[#ff8c42] font-medium transition-colors">Imóveis</Link>
            <Link to="/blog" className="text-[#1a3a52] hover:text-[#ff8c42] font-medium transition-colors">Blog</Link>
            
            <div className="h-6 w-px bg-gray-200"></div>

            {/* WhatsApp Button for Desktop */}
            <Button variant="outline" className="bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700 shadow-md" onClick={handleWhatsAppClick}>
                <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
            </Button>

            {user ? <div className="flex items-center space-x-4">
                 <Link to="/admin/dashboard">
                    <Button variant="ghost" className="text-[#1a3a52] hover:text-[#0d5a7a] font-medium">
                        <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
                    </Button>
                 </Link>
              
                <div className="relative" ref={profileMenuRef}>
                  <Button variant="ghost" className="flex items-center space-x-2 hover:bg-gray-100 rounded-full px-4" onClick={() => setIsProfileOpen(!isProfileOpen)}>
                    <div className="w-8 h-8 bg-[#1a3a52] rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {broker?.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-[#1a3a52] max-w-[100px] truncate">
                      {broker?.name || user.email}
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </Button>

                  <AnimatePresence>
                    {isProfileOpen && <motion.div initial={{
                  opacity: 0,
                  y: 10
                }} animate={{
                  opacity: 1,
                  y: 0
                }} exit={{
                  opacity: 0,
                  y: 10
                }} transition={{
                  duration: 0.2
                }} className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-xl border border-gray-100 py-1 overflow-hidden z-50">
                        <Link to="/admin/dashboard" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#1a3a52]" onClick={() => setIsProfileOpen(false)}>
                          <LayoutDashboard className="w-4 h-4 mr-2" /> Painel Admin
                        </Link>
                        <Link to="/perfil" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#1a3a52]" onClick={() => setIsProfileOpen(false)}>
                          <User className="w-4 h-4 mr-2" /> Meu Perfil
                        </Link>
                        <div className="border-t border-gray-100 my-1"></div>
                        <button className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50" onClick={handleLogout}>
                          <LogOut className="w-4 h-4 mr-2" /> Sair
                        </button>
                      </motion.div>}
                  </AnimatePresence>
                </div>
              </div> : <div className="flex items-center space-x-4">
                <Link to="/login" className="text-[#1a3a52] font-semibold hover:text-[#ff8c42] transition-colors">
                  Admin Login
                </Link>
                <Link to="/cadastro">
                  <Button className="bg-[#ff8c42] hover:bg-[#ff8c42]/90 text-white rounded-full px-6 shadow-md hover:shadow-lg transition-all">
                    Criar Conta
                  </Button>
                </Link>
              </div>}
          </div>

          {/* Mobile Toggle */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 text-[#1a3a52]">
            {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && <motion.div initial={{
        opacity: 0,
        height: 0
      }} animate={{
        opacity: 1,
        height: 'auto'
      }} exit={{
        opacity: 0,
        height: 0
      }} className="md:hidden bg-white border-t border-gray-100 overflow-hidden">
            <div className="px-4 py-6 space-y-4">
              <Link to="/" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-[#1a3a52] font-medium">
                <Home className="w-5 h-5" /> <span>Início</span>
              </Link>
              <Link to="/imoveis" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-[#1a3a52] font-medium">
                <Search className="w-5 h-5" /> <span>Imóveis</span>
              </Link>
              <Link to="/blog" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-[#1a3a52] font-medium">
                <FileText className="w-5 h-5" /> <span>Blog</span>
              </Link>
              
              <div className="border-t border-gray-100 my-4"></div>

              {/* WhatsApp Button for Mobile */}
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={handleWhatsAppClick}>
                  <MessageCircle className="w-5 h-5 mr-2" /> Fale via WhatsApp
              </Button>

              {user ? <>
                  <Link to="/admin/dashboard" className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 text-[#1a3a52] font-medium">
                    <LayoutDashboard className="w-5 h-5" /> <span>Dashboard</span>
                  </Link>
                  <Link to="/perfil" className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 text-[#1a3a52] font-medium">
                    <User className="w-5 h-5" /> <span>Meu Perfil</span>
                  </Link>
                  <button onClick={logout} className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-red-50 text-red-600 font-medium">
                    <LogOut className="w-5 h-5" /> <span>Sair</span>
                  </button>
                </> : <div className="grid grid-cols-2 gap-4 pt-2">
                  <Link to="/login">
                    <Button variant="outline" className="w-full border-[#1a3a52] text-[#1a3a52]">
                      Admin Login
                    </Button>
                  </Link>
                  <Link to="/cadastro">
                    <Button className="w-full bg-[#ff8c42] hover:bg-[#ff8c42]/90 text-white">Criar Conta</Button>
                  </Link>
                </div>}
            </div>
          </motion.div>}
      </AnimatePresence>
    </nav>;
};
export default Navigation;