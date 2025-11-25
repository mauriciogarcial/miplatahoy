import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";

// --- Types & Constants ---

type ViewState = 'SPLASH' | 'LOGIN' | 'REGISTER' | 'ONBOARDING' | 'HOME' | 'ADD_TRANSACTION' | 'SETTINGS';

interface User {
  email: string;
  name: string;
  onboardingComplete: boolean;
}

interface Account {
  id: string;
  name: string;
  type: 'CASH' | 'BANK' | 'NEQUI' | 'DAVIPLATA' | 'OTHER';
  balance: number;
}

interface Transaction {
  id: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  categoryId: string;
  accountId: string;
  date: string; // ISO string
  description: string;
  isRecurring?: boolean;
  frequency?: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
}

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

const CATEGORIES: Category[] = [
  { id: 'food', name: 'Alimentación', icon: 'fa-utensils', color: 'bg-orange-100 text-orange-600' },
  { id: 'transport', name: 'Transporte', icon: 'fa-bus', color: 'bg-blue-100 text-blue-600' },
  { id: 'housing', name: 'Vivienda', icon: 'fa-house', color: 'bg-indigo-100 text-indigo-600' },
  { id: 'leisure', name: 'Ocio', icon: 'fa-gamepad', color: 'bg-purple-100 text-purple-600' },
  { id: 'health', name: 'Salud', icon: 'fa-heart-pulse', color: 'bg-red-100 text-red-600' },
  { id: 'shopping', name: 'Compras', icon: 'fa-bag-shopping', color: 'bg-pink-100 text-pink-600' },
  { id: 'income', name: 'Ingreso', icon: 'fa-money-bill-wave', color: 'bg-green-100 text-green-600' },
  { id: 'other', name: 'Otros', icon: 'fa-shapes', color: 'bg-gray-100 text-gray-600' },
];

const ACCOUNT_TYPES = {
  CASH: { icon: 'fa-wallet', label: 'Efectivo', color: 'text-green-600 bg-green-50' },
  BANK: { icon: 'fa-building-columns', label: 'Banco', color: 'text-blue-600 bg-blue-50' },
  NEQUI: { icon: 'fa-mobile-screen', label: 'Nequi', color: 'text-purple-600 bg-purple-50' },
  DAVIPLATA: { icon: 'fa-mobile-screen', label: 'Daviplata', color: 'text-red-600 bg-red-50' },
  OTHER: { icon: 'fa-piggy-bank', label: 'Otro', color: 'text-gray-600 bg-gray-50' },
};

// --- AI Service ---

class AIService {
  private ai: GoogleGenAI;
  private modelId = "gemini-2.5-flash";

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async getCoachTip(transactions: Transaction[], totalBalance: number): Promise<string> {
    if (!process.env.API_KEY) return "Configura tu API Key para recibir consejos personalizados.";
    
    // Simplify data for prompt to save tokens and privacy
    const recentTx = transactions.slice(0, 10).map(t => ({
      amount: t.amount,
      type: t.type,
      desc: t.description || 'Sin descripción',
      date: t.date
    }));

    const prompt = `
      Act as a friendly, warm financial coach for a user in Colombia (currency COP).
      User Balance: $${totalBalance}.
      Recent Transactions: ${JSON.stringify(recentTx)}.
      
      Give a SINGLE, SHORT sentence (max 20 words) of advice or motivation in Spanish.
      Be casual but helpful. If balance is low, be encouraging. If high, suggest saving.
      Do NOT mention specific dates or IDs.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: this.modelId,
        contents: prompt,
      });
      return response.text || "¡Sigue así! Cuidar tu dinero es cuidar tu futuro.";
    } catch (e) {
      console.error("AI Error", e);
      return "¡Hola! Recuerda registrar tus gastos diarios.";
    }
  }

  async categorizeTransaction(description: string): Promise<string> {
    if (!process.env.API_KEY) return 'other';
    
    const prompt = `
      Categorize this expense description: "${description}".
      Available categories: food, transport, housing, leisure, health, shopping, other.
      Return ONLY the category id string. If unsure, return 'other'.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: this.modelId,
        contents: prompt,
      });
      const text = response.text?.trim().toLowerCase() || 'other';
      return CATEGORIES.find(c => c.id === text) ? text : 'other';
    } catch (e) {
      return 'other';
    }
  }

  async parseTransactionFromText(text: string): Promise<{ amount: number; type: 'INCOME' | 'EXPENSE'; description: string } | null> {
    if (!process.env.API_KEY) return null;

    const prompt = `
      Analyze the following financial transaction description in Spanish (from Colombia, currency is COP) and extract the amount, type, and a clean description.

      Text: "${text}"

      - "amount" should be a number, without commas or currency symbols.
      - "type" must be either "INCOME" or "EXPENSE".
      - "description" should be a short, clean summary of the transaction.

      Examples:
      - "Pagué 50.000 de la factura de luz" -> { "amount": 50000, "type": "EXPENSE", "description": "Factura de luz" }
      - "café y pan por 8500" -> { "amount": 8500, "type": "EXPENSE", "description": "Café y pan" }
      - "recibí 2.000.000 de salario" -> { "amount": 2000000, "type": "INCOME", "description": "Salario" }
      - "mercado en el éxito 150 mil" -> { "amount": 150000, "type": "EXPENSE", "description": "Mercado en el éxito" }
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: this.modelId,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              amount: { type: Type.NUMBER, description: "The transaction amount as a number." },
              type: { type: Type.STRING, description: "Must be 'INCOME' or 'EXPENSE'." },
              description: { type: Type.STRING, description: "A clean description of the transaction." },
            },
            required: ["amount", "type", "description"]
          }
        }
      });

      const jsonStr = response.text.trim();
      const parsed = JSON.parse(jsonStr);
      
      if (parsed.amount && parsed.type && parsed.description) {
        return parsed as { amount: number; type: 'INCOME' | 'EXPENSE'; description: string };
      }
      return null;
    } catch (e) {
      console.error("AI Parsing Error", e);
      return null;
    }
  }
}

const aiService = new AIService();

// --- App Context ---

interface AppContextType {
  view: ViewState;
  setView: (v: ViewState) => void;
  user: User | null;
  login: (email: string) => void;
  logout: () => void;
  completeOnboarding: () => void;
  accounts: Account[];
  addAccount: (acc: Omit<Account, 'id'>) => void;
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id'>) => Promise<void>;
  totalBalance: number;
  coachTip: string;
  refreshCoachTip: () => void;
  formatCurrency: (val: number) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State persistence
  const [view, setView] = useState<ViewState>('SPLASH');
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('mph_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem('mph_accounts');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Efectivo', type: 'CASH', balance: 0 },
      { id: '2', name: 'Nequi', type: 'NEQUI', balance: 0 }
    ];
  });
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('mph_transactions');
    return saved ? JSON.parse(saved) : [];
  });
  const [coachTip, setCoachTip] = useState<string>("Analizando tus finanzas...");

  // Effects
  useEffect(() => { localStorage.setItem('mph_user', JSON.stringify(user)); }, [user]);
  useEffect(() => { localStorage.setItem('mph_accounts', JSON.stringify(accounts)); }, [accounts]);
  useEffect(() => { localStorage.setItem('mph_transactions', JSON.stringify(transactions)); }, [transactions]);

  // Derived state
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  // Actions
  const login = (email: string) => {
    setUser({ email, name: email.split('@')[0], onboardingComplete: false });
    setView('ONBOARDING');
  };

  const logout = () => {
    setUser(null);
    setView('SPLASH');
  };

  const completeOnboarding = () => {
    if (user) setUser({ ...user, onboardingComplete: true });
    setView('HOME');
    refreshCoachTip();
  };

  const addAccount = (acc: Omit<Account, 'id'>) => {
    const newAccount = { ...acc, id: Date.now().toString() };
    setAccounts([...accounts, newAccount]);
  };

  const addTransaction = async (tx: Omit<Transaction, 'id'>) => {
    const newTx = { ...tx, id: Date.now().toString() };
    
    // Update account balance
    const updatedAccounts = accounts.map(acc => {
      if (acc.id === tx.accountId) {
        const change = tx.type === 'INCOME' ? tx.amount : -tx.amount;
        return { ...acc, balance: acc.balance + change };
      }
      return acc;
    });

    setAccounts(updatedAccounts);
    setTransactions([newTx, ...transactions]);
    setView('HOME'); // Return home
    
    // Trigger AI tip update slightly delayed
    setTimeout(() => refreshCoachTip(), 1000);
  };

  const refreshCoachTip = async () => {
    setCoachTip("Consultando a tu coach...");
    const tip = await aiService.getCoachTip(transactions, totalBalance);
    setCoachTip(tip);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Initial Route Check
  useEffect(() => {
    if (!user) setView('SPLASH');
    else if (!user.onboardingComplete) setView('ONBOARDING');
    else setView('HOME');
  }, [user]);

  return (
    <AppContext.Provider value={{
      view, setView, user, login, logout, completeOnboarding,
      accounts, addAccount, transactions, addTransaction,
      totalBalance, coachTip, refreshCoachTip, formatCurrency
    }}>
      {children}
    </AppContext.Provider>
  );
};

const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

// --- Components ---

const Button: React.FC<{ 
  children: React.ReactNode; 
  onClick?: () => void; 
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  className?: string;
  fullWidth?: boolean;
  disabled?: boolean;
}> = ({ children, onClick, variant = 'primary', className = '', fullWidth = false, disabled = false }) => {
  const baseStyle = "py-3.5 px-6 rounded-2xl font-semibold transition-all active:scale-95 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-teal-500 text-white shadow-lg shadow-teal-500/30 hover:bg-teal-600 disabled:bg-teal-300 disabled:shadow-none disabled:cursor-not-allowed",
    secondary: "bg-orange-500 text-white shadow-lg shadow-orange-500/30 hover:bg-orange-600",
    outline: "border-2 border-slate-200 text-slate-600 hover:bg-slate-50",
    ghost: "text-teal-600 hover:bg-teal-50"
  };
  
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

// 1. Auth Flow
const SplashView = () => {
  const { setView } = useApp();
  return (
    <div className="h-screen flex flex-col items-center justify-center p-6 bg-white text-center">
      <div className="w-20 h-20 bg-teal-100 rounded-3xl flex items-center justify-center mb-6 text-teal-600 text-4xl">
        <i className="fa-solid fa-coins"></i>
      </div>
      <h1 className="text-4xl font-bold text-slate-800 mb-2">MiPlataHoy</h1>
      <p className="text-slate-500 mb-12 text-lg">Toda tu plata en un solo número.</p>
      
      <div className="w-full space-y-4">
        <Button fullWidth onClick={() => setView('REGISTER')}>Crear cuenta</Button>
        <Button fullWidth variant="outline" onClick={() => setView('LOGIN')}>Iniciar sesión</Button>
        <div className="pt-4">
           <button className="text-slate-500 font-medium flex items-center justify-center gap-3 w-full p-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
             <i className="fa-brands fa-google text-lg"></i> Continuar con Google
           </button>
        </div>
      </div>
    </div>
  );
};

const LoginView = () => {
  const { login, setView } = useApp();
  const [email, setEmail] = useState('');

  return (
    <div className="h-screen flex flex-col p-6 bg-white">
      <button onClick={() => setView('SPLASH')} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 mb-8">
        <i className="fa-solid fa-arrow-left text-slate-600"></i>
      </button>
      <h2 className="text-3xl font-bold text-slate-800 mb-2">Bienvenido de nuevo</h2>
      <p className="text-slate-500 mb-8">Ingresa tus datos para continuar.</p>
      
      <div className="space-y-4 flex-1">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Correo electrónico</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
            placeholder="tu@correo.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
          <input 
            type="password" 
            className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
            placeholder="••••••••"
          />
        </div>
        <div className="text-right">
          <button className="text-teal-600 text-sm font-medium">¿Olvidaste tu contraseña?</button>
        </div>
      </div>
      
      <div className="pb-4">
        <Button fullWidth onClick={() => login(email || 'usuario@demo.com')} disabled={!email}>
          Iniciar sesión
        </Button>
        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-4 text-slate-400 text-sm">o</span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>
        <button className="text-slate-500 font-medium flex items-center justify-center gap-3 w-full p-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
          <i className="fa-brands fa-google text-lg"></i> Continuar con Google
        </button>
        <p className="text-center mt-6 text-slate-500 text-sm">
          ¿No tienes cuenta? <button onClick={() => setView('REGISTER')} className="text-teal-600 font-semibold">Crea una</button>
        </p>
      </div>
    </div>
  );
};

const RegisterView = () => {
  const { login, setView } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const getPasswordStrength = (pw: string) => {
    let strength = 0;
    if (pw.length >= 8) strength++;
    if (pw.match(/[a-z]/) && pw.match(/[A-Z]/)) strength++;
    if (pw.match(/[0-9]/)) strength++;
    if (pw.match(/[^a-zA-Z0-9]/)) strength++;
    return strength;
  };
  const strength = getPasswordStrength(password);
  
  const isFormValid = email && password.length >= 8 && password === confirmPassword && termsAccepted;

  return (
    <div className="h-screen flex flex-col p-6 bg-white">
      <button onClick={() => setView('SPLASH')} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 mb-8">
        <i className="fa-solid fa-arrow-left text-slate-600"></i>
      </button>
      <h2 className="text-3xl font-bold text-slate-800 mb-2">Crear cuenta</h2>
      <p className="text-slate-500 mb-8">Empieza a controlar tu dinero hoy.</p>
      
      <div className="space-y-4 flex-1">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Correo electrónico</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
            placeholder="tu@correo.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
            placeholder="Mínimo 8 caracteres"
          />
          <div className="mt-2 flex gap-1">
            {[1,2,3,4].map(i => (
              <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= strength ? 'bg-teal-500' : 'bg-slate-200'}`}></div>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Confirmar Contraseña</label>
          <input 
            type="password" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
            placeholder="Repite tu contraseña"
          />
          {password && confirmPassword && password !== confirmPassword && <p className="text-red-500 text-xs mt-1">Las contraseñas no coinciden.</p>}
        </div>
        <div className="flex items-center space-x-2 pt-2">
          <input type="checkbox" id="terms" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
          <label htmlFor="terms" className="text-sm text-slate-500">
            Acepto los <a href="#" className="text-teal-600 font-semibold underline">Términos y Condiciones</a>
          </label>
        </div>
      </div>

      <div className="pb-4">
        <Button fullWidth onClick={() => login(email)} disabled={!isFormValid}>
          Crear cuenta
        </Button>
        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-4 text-slate-400 text-sm">o</span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>
        <button className="text-slate-500 font-medium flex items-center justify-center gap-3 w-full p-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
          <i className="fa-brands fa-google text-lg"></i> Continuar con Google
        </button>
        <p className="text-center mt-6 text-slate-500 text-sm">
          ¿Ya tienes cuenta? <button onClick={() => setView('LOGIN')} className="text-teal-600 font-semibold">Inicia sesión</button>
        </p>
      </div>
    </div>
  );
};

// 2. Onboarding Flow
const OnboardingView = () => {
  const { completeOnboarding } = useApp();
  const [step, setStep] = useState(0);

  const steps = [
    {
      icon: 'fa-sack-dollar',
      title: 'Tu saldo en un vistazo',
      desc: 'Olvídate de sumar mentalmente. Ve cuánto dinero tienes disponible sumando todas tus cuentas.'
    },
    {
      icon: 'fa-bolt',
      title: 'Registro ultra rápido',
      desc: 'Registra tus gastos e ingresos en menos de 5 segundos. Sin complicaciones.'
    },
    {
      icon: 'fa-robot',
      title: 'Tu Coach Financiero',
      desc: 'Recibe consejos personalizados con Inteligencia Artificial para mejorar tus hábitos.'
    }
  ];

  return (
    <div className="h-screen flex flex-col p-6 bg-white text-center">
      <div className="flex justify-end pt-4">
        <button onClick={completeOnboarding} className="text-slate-400 font-medium">Omitir</button>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-64 h-64 bg-teal-50 rounded-full flex items-center justify-center mb-8 relative">
           <div className="absolute inset-0 rounded-full border-4 border-teal-100 animate-pulse"></div>
           <i className={`fa-solid ${steps[step].icon} text-6xl text-teal-500`}></i>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-4">{steps[step].title}</h2>
        <p className="text-slate-500 px-4 leading-relaxed">{steps[step].desc}</p>
      </div>

      <div className="pb-8">
        <div className="flex justify-center gap-2 mb-8">
          {steps.map((_, i) => (
            <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-teal-500' : 'w-2 bg-slate-200'}`}></div>
          ))}
        </div>
        <Button fullWidth onClick={() => {
          if (step < 2) setStep(step + 1);
          else completeOnboarding();
        }}>
          {step === 2 ? '¡Empezar!' : 'Siguiente'}
        </Button>
      </div>
    </div>
  );
};

// 3. Home Flow
const HomeView = () => {
  const { user, setView, totalBalance, transactions, formatCurrency, coachTip } = useApp();
  const [showAccounts, setShowAccounts] = useState(false);
  const [isCoachTipVisible, setIsCoachTipVisible] = useState(true);

  // Greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-white p-6 pb-8 rounded-b-[2.5rem] shadow-sm relative z-10">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-slate-400 text-sm font-medium">{greeting},</p>
            <h1 className="text-xl font-bold text-slate-800">{user?.name || 'Amigo'}</h1>
          </div>
          <button onClick={() => setView('SETTINGS')} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-slate-100">
            <i className="fa-solid fa-gear"></i>
          </button>
        </div>

        {/* Balance */}
        <div className="text-center mb-6 cursor-pointer" onClick={() => setShowAccounts(true)}>
          <p className="text-slate-400 text-sm font-medium mb-1 uppercase tracking-wide">Mi Plata Hoy</p>
          <h2 className="text-[2.75rem] leading-none font-bold text-slate-800 tracking-tight">
            {formatCurrency(totalBalance)}
          </h2>
          <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-50 text-green-600 text-xs font-semibold">
            <i className="fa-solid fa-arrow-trend-up"></i> +2.4% vs mes anterior
          </div>
        </div>

        {/* Coach Card */}
        {isCoachTipVisible && (
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-4 text-white relative overflow-hidden shadow-lg shadow-indigo-500/20">
            <button onClick={() => setIsCoachTipVisible(false)} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center z-20 transition-colors">
              <i className="fa-solid fa-times text-white text-xs"></i>
            </button>
            <div className="relative z-10 flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <i className="fa-solid fa-wand-magic-sparkles text-white text-lg"></i>
              </div>
              <div className="flex-1 pr-4">
                <h3 className="font-bold text-sm opacity-90 mb-1">Tip del Coach IA</h3>
                <p className="text-sm leading-relaxed font-medium opacity-95">
                  "{coachTip}"
                </p>
              </div>
            </div>
            {/* Decorative circles */}
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute -left-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
          </div>
        )}
      </div>

      {/* Transactions List */}
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-slate-800">Últimos movimientos</h3>
          <button className="text-teal-600 text-sm font-semibold">Ver todo</button>
        </div>

        <div className="space-y-3">
          {transactions.length === 0 ? (
            <div className="text-center py-10 opacity-50">
              <i className="fa-solid fa-receipt text-4xl mb-2 text-slate-300"></i>
              <p>No hay movimientos aún.</p>
            </div>
          ) : (
            transactions.slice(0, 5).map(tx => {
              const category = CATEGORIES.find(c => c.id === tx.categoryId) || CATEGORIES[7];
              const isExpense = tx.type === 'EXPENSE';
              return (
                <div key={tx.id} className="bg-white p-4 rounded-2xl flex items-center gap-4 shadow-sm">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${category.color}`}>
                    <i className={`fa-solid ${category.icon}`}></i>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-800 flex items-center gap-2">
                      {tx.description}
                      {tx.isRecurring && <i className="fa-solid fa-repeat text-teal-500 text-xs" title={`Recurrente ${tx.frequency}`}></i>}
                    </p>
                    <p className="text-xs text-slate-400">{category.name} • {new Date(tx.date).toLocaleDateString()}</p>
                  </div>
                  <div className={`font-bold ${isExpense ? 'text-slate-800' : 'text-green-600'}`}>
                    {isExpense ? '-' : '+'}{formatCurrency(tx.amount)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Accounts Bottom Sheet Mock */}
      {showAccounts && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAccounts(false)}></div>
          <div className="bg-white rounded-t-[2rem] p-6 relative z-10 animate-slide-up max-h-[80vh] overflow-y-auto">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6"></div>
            <h3 className="text-xl font-bold text-slate-800 mb-4">Mis Cuentas</h3>
            <div className="space-y-3 mb-6">
               {useApp().accounts.map(acc => {
                 const typeInfo = ACCOUNT_TYPES[acc.type] || ACCOUNT_TYPES.OTHER;
                 return (
                   <div key={acc.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                     <div className="flex items-center gap-3">
                       <div className={`w-10 h-10 rounded-full flex items-center justify-center ${typeInfo.color}`}>
                         <i className={`fa-solid ${typeInfo.icon}`}></i>
                       </div>
                       <div>
                         <p className="font-bold text-slate-700">{acc.name}</p>
                         <p className="text-xs text-slate-400">{typeInfo.label}</p>
                       </div>
                     </div>
                     <p className="font-bold text-slate-800">{formatCurrency(acc.balance)}</p>
                   </div>
                 )
               })}
            </div>
            <Button variant="outline" fullWidth onClick={() => { setShowAccounts(false); setView('SETTINGS'); }}>
              Administrar cuentas
            </Button>
          </div>
        </div>
      )}

      {/* FAB */}
      <button 
        onClick={() => setView('ADD_TRANSACTION')}
        className="fixed bottom-6 right-6 w-16 h-16 bg-teal-500 text-white rounded-full shadow-lg shadow-teal-500/40 flex items-center justify-center text-2xl hover:scale-105 active:scale-95 transition-all z-40"
      >
        <i className="fa-solid fa-plus"></i>
      </button>
    </div>
  );
};

// 4. Transaction Flow
const AddTransactionView = () => {
  const { setView, addTransaction, accounts } = useApp();
  const [step, setStep] = useState(1);
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [amountStr, setAmountStr] = useState('0');
  const [desc, setDesc] = useState('');
  const [naturalInput, setNaturalInput] = useState('');
  const [category, setCategory] = useState('other');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState<'WEEKLY' | 'BIWEEKLY' | 'MONTHLY'>('MONTHLY');

  // Step 1: Type & Amount (manual or AI)
  // Step 2: Details

  const handleNumPad = (val: string) => {
    if (val === 'back') {
      setAmountStr(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
    } else {
      setAmountStr(prev => prev === '0' ? val : prev + val);
    }
  };
  
  const handleAIParse = async () => {
    if (!naturalInput.trim()) return;
    setIsProcessing(true);
    const result = await aiService.parseTransactionFromText(naturalInput);
    setIsProcessing(false);

    if (result) {
        setAmountStr(result.amount.toString());
        setType(result.type);
        setDesc(result.description);
        setStep(2);
    } else {
        alert("No pudimos entender eso. Por favor, intenta de nuevo o ingresa el monto manualmente.");
    }
  };

  const handleNext = async () => {
    if (step === 1) {
      if (parseFloat(amountStr) === 0) return;
      setStep(2);
    } else {
      setIsProcessing(true);
      // Categorize if empty
      let finalCat = category;
      if (desc && category === 'other') {
         finalCat = await aiService.categorizeTransaction(desc);
      }
      
      await addTransaction({
        amount: parseInt(amountStr),
        type,
        description: desc || (type === 'EXPENSE' ? 'Gasto general' : 'Ingreso'),
        categoryId: finalCat,
        accountId,
        date: new Date().toISOString(),
        isRecurring: isRecurring,
        frequency: isRecurring ? frequency : undefined,
      });
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <button onClick={() => step === 1 ? setView('HOME') : setStep(1)} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600">
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <span className="font-semibold text-slate-500">
          {step === 1 ? 'Nuevo Movimiento' : 'Detalles'}
        </span>
        <div className="w-10"></div>
      </div>

      {step === 1 && (
        <div className="flex-1 flex flex-col">
          <div className="p-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">Describe tu movimiento</label>
            <textarea
              value={naturalInput}
              onChange={e => setNaturalInput(e.target.value)}
              className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all resize-none"
              placeholder="Ej: Café con pan por 8.500"
              rows={3}
            ></textarea>
            <Button fullWidth onClick={handleAIParse} disabled={isProcessing || !naturalInput} className="mt-4">
              {isProcessing && naturalInput ? <i className="fa-solid fa-circle-notch fa-spin"></i> : 'Analizar con IA'}
            </Button>
          </div>

          <div className="relative flex py-2 items-center px-6">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-slate-400 text-sm font-semibold">ó ingresa manually</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>
          
          <div className="flex-1 flex flex-col items-center p-6 pt-2">
            {/* Toggle */}
            <div className="flex bg-slate-100 p-1 rounded-2xl mb-6 w-full max-w-xs">
              <button 
                onClick={() => setType('EXPENSE')}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${type === 'EXPENSE' ? 'bg-white text-red-500 shadow-sm' : 'text-slate-400'}`}
              >
                Gasto
              </button>
              <button 
                onClick={() => setType('INCOME')}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${type === 'INCOME' ? 'bg-white text-green-500 shadow-sm' : 'text-slate-400'}`}
              >
                Ingreso
              </button>
            </div>

            {/* Amount Display */}
            <div className="text-center">
              <span className={`text-4xl font-bold ${type === 'EXPENSE' ? 'text-slate-800' : 'text-green-600'}`}>
                $ {parseInt(amountStr).toLocaleString('es-CO')}
              </span>
            </div>
          </div>

          {/* Numpad */}
          <div className="bg-slate-50 rounded-t-[2rem] p-6 pb-8">
             <div className="grid grid-cols-3 gap-4 mb-6">
               {[1,2,3,4,5,6,7,8,9].map(n => (
                 <button key={n} onClick={() => handleNumPad(n.toString())} className="h-16 rounded-2xl bg-white text-2xl font-bold text-slate-700 shadow-sm active:bg-slate-100">
                   {n}
                 </button>
               ))}
               <div className="h-16"></div>
               <button onClick={() => handleNumPad('0')} className="h-16 rounded-2xl bg-white text-2xl font-bold text-slate-700 shadow-sm active:bg-slate-100">
                 0
               </button>
               <button onClick={() => handleNumPad('back')} className="h-16 rounded-2xl bg-slate-200 text-xl text-slate-600 shadow-sm active:bg-slate-300">
                 <i className="fa-solid fa-delete-left"></i>
               </button>
             </div>
             <Button fullWidth onClick={handleNext} disabled={parseInt(amountStr) === 0}>Continuar</Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="flex-1 flex flex-col p-6">
          <div className="flex-1 space-y-6">
            
             {/* Description Input */}
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Descripción</label>
              <input 
                type="text" 
                value={desc}
                onChange={e => setDesc(e.target.value)}
                className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 outline-none text-slate-700"
              />
            </div>
            
            {/* Category Selector */}
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-3">Categoría</label>
               <div className="grid grid-cols-4 gap-3">
                 {CATEGORIES.map(c => (
                   <button 
                    key={c.id} 
                    onClick={() => setCategory(c.id)}
                    className={`flex flex-col items-center gap-2 p-2 rounded-xl border-2 transition-all ${category === c.id ? 'border-teal-500 bg-teal-50' : 'border-transparent hover:bg-slate-50'}`}
                   >
                     <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${c.color}`}>
                       <i className={`fa-solid ${c.icon}`}></i>
                     </div>
                     <span className="text-[10px] font-medium text-slate-600 truncate w-full text-center">{c.name}</span>
                   </button>
                 ))}
               </div>
            </div>

            {/* Account Selector */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Cuenta</label>
              <div className="space-y-2">
                {accounts.map(acc => (
                  <button 
                    key={acc.id}
                    onClick={() => setAccountId(acc.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${accountId === acc.id ? 'border-teal-500 bg-teal-50 ring-1 ring-teal-500' : 'border-slate-200 bg-white'}`}
                  >
                    <div className="flex items-center gap-3">
                       <i className={`fa-solid ${ACCOUNT_TYPES[acc.type].icon} text-slate-400`}></i>
                       <span className="font-medium text-slate-700">{acc.name}</span>
                    </div>
                    {accountId === acc.id && <i className="fa-solid fa-check text-teal-500"></i>}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Recurring Transaction Toggle */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">¿Es recurrente?</label>
                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl">
                    <span className="font-medium text-slate-600">Hacer este movimiento recurrente</span>
                    <button
                        onClick={() => setIsRecurring(!isRecurring)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            isRecurring ? 'bg-teal-500' : 'bg-slate-200'
                        }`}
                    >
                        <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                isRecurring ? 'translate-x-5' : 'translate-x-0'
                            }`}
                        />
                    </button>
                </div>
            </div>

            {/* Frequency Selector - Conditional */}
            {isRecurring && (
                <div className="animate-fade-in">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Frecuencia</label>
                    <div className="grid grid-cols-3 gap-2">
                        {(['WEEKLY', 'BIWEEKLY', 'MONTHLY'] as const).map(freq => (
                            <button
                                key={freq}
                                onClick={() => setFrequency(freq)}
                                className={`py-3 rounded-xl text-sm font-semibold transition-all ${
                                    frequency === freq
                                        ? 'bg-teal-500 text-white shadow'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                {freq === 'WEEKLY' ? 'Semanal' : freq === 'BIWEEKLY' ? 'Quincenal' : 'Mensual'}
                            </button>
                        ))}
                    </div>
                </div>
            )}


            {/* Date Picker */}
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Fecha</label>
              <input type="date" className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 outline-none text-slate-700" defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
          </div>

          <Button fullWidth onClick={handleNext} disabled={isProcessing}>
            {isProcessing ? <i className="fa-solid fa-circle-notch fa-spin"></i> : 'Guardar Movimiento'}
          </Button>
        </div>
      )}
    </div>
  );
};

// 5. Settings Manager
const SettingsView = () => {
    const { user, logout, setView, accounts, addAccount, formatCurrency } = useApp();
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState('');
    const [newBalance, setNewBalance] = useState('');
    const [newType, setNewType] = useState<Account['type']>('CASH');
  
    const handleAdd = () => {
        if(!newName) return;
        addAccount({
            name: newName,
            balance: parseInt(newBalance) || 0,
            type: newType
        });
        setIsAdding(false);
        setNewName('');
        setNewBalance('');
        setNewType('CASH');
    };

    const handleResetData = () => {
        const confirmation = confirm('¿Estás seguro de que quieres borrar todas tus cuentas y transacciones? Tu usuario no se eliminará. Esta acción no se puede deshacer.');
        if (confirmation) {
            localStorage.removeItem('mph_accounts');
            localStorage.removeItem('mph_transactions');
            // Force a reload to clear state and show changes
            window.location.reload(); 
        }
    };

    const handleDeleteAccount = () => {
        const confirmation = prompt('Esta acción es irreversible y eliminará todos tus datos. Escribe "ELIMINAR" para confirmar.');
        if (confirmation === 'ELIMINAR') {
            localStorage.clear();
            logout();
        } else if (confirmation !== null) {
            alert('La confirmación no es correcta. Tu cuenta no ha sido eliminada.');
        }
    };

    return (
      <div className="min-h-screen bg-slate-50 p-6 pb-24">
         <div className="flex items-center gap-4 mb-8">
            <button onClick={() => setView('HOME')} className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-600">
                <i className="fa-solid fa-arrow-left"></i>
            </button>
            <h2 className="text-2xl font-bold text-slate-800">Configuración</h2>
         </div>

         {/* User Account Section */}
         <div className="bg-white p-5 rounded-2xl shadow-sm mb-6">
           <h3 className="font-bold text-slate-800 text-lg mb-4">Cuenta</h3>
           <div className="space-y-2">
             <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Correo</span>
                <span className="font-semibold text-slate-700">{user?.email}</span>
             </div>
             <button className="text-teal-600 font-semibold text-sm w-full text-left pt-2">Cambiar contraseña</button>
           </div>
         </div>

         {/* Pockets/Accounts Section */}
         <div className="bg-white p-5 rounded-2xl shadow-sm mb-6">
            <h3 className="font-bold text-slate-800 text-lg mb-4">Mis Bolsillos</h3>
            <div className="space-y-3">
                {accounts.map(acc => (
                    <div key={acc.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${ACCOUNT_TYPES[acc.type].color}`}>
                                <i className={`fa-solid ${ACCOUNT_TYPES[acc.type].icon}`}></i>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 text-sm">{acc.name}</h4>
                                <p className="text-xs text-slate-400">{ACCOUNT_TYPES[acc.type].label}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-slate-800 text-sm">{formatCurrency(acc.balance)}</p>
                            <button className="text-xs text-teal-600 font-medium">Editar</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Account Form */}
            {isAdding ? (
                <div className="mt-6 pt-4 border-t border-slate-100">
                    <h4 className="font-bold text-slate-800 mb-3 text-sm">Nuevo Bolsillo</h4>
                    <div className="space-y-3">
                        <input 
                            className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:border-teal-500" 
                            placeholder="Nombre (ej. Ahorros Viaje)" 
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                        />
                        <input 
                            className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:border-teal-500" 
                            placeholder="Saldo Inicial" 
                            type="number"
                            value={newBalance}
                            onChange={e => setNewBalance(e.target.value)}
                        />
                        <select 
                            className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none"
                            value={newType}
                            onChange={e => setNewType(e.target.value as any)}
                        >
                            {Object.entries(ACCOUNT_TYPES).map(([key, val]) => (
                                <option key={key} value={key}>{val.label}</option>
                            ))}
                        </select>
                        <div className="flex gap-2 pt-2">
                            <Button variant="outline" className="flex-1 !py-2.5" onClick={() => setIsAdding(false)}>Cancelar</Button>
                            <Button className="flex-1 !py-2.5" onClick={handleAdd}>Guardar</Button>
                        </div>
                    </div>
                </div>
            ) : (
                <button 
                    onClick={() => setIsAdding(true)}
                    className="mt-4 w-full py-3 border-2 border-dashed border-slate-300 rounded-2xl text-slate-400 font-semibold hover:bg-white hover:border-teal-400 hover:text-teal-500 transition-all text-sm"
                >
                    + Agregar otro bolsillo
                </button>
            )}
         </div>

         {/* Actions Section */}
         <div className="bg-white p-3 rounded-2xl shadow-sm">
           <div className="space-y-1">
             <button onClick={handleResetData} className="w-full text-left text-blue-600 font-semibold p-3 rounded-lg hover:bg-blue-50 text-sm">Reiniciar datos de la app</button>
             <button className="w-full text-left text-slate-700 font-medium p-3 rounded-lg hover:bg-slate-50 text-sm">Centro de Ayuda</button>
             <button className="w-full text-left text-slate-700 font-medium p-3 rounded-lg hover:bg-slate-50 text-sm">Privacidad</button>
             <button onClick={logout} className="w-full text-left text-orange-600 font-semibold p-3 rounded-lg hover:bg-orange-50 text-sm">Cerrar sesión</button>
             <button onClick={handleDeleteAccount} className="w-full text-left text-red-600 font-semibold p-3 rounded-lg hover:bg-red-50 text-sm mt-1">Eliminar mi cuenta</button>
           </div>
         </div>
      </div>
    );
};

// --- Main App Router ---

const Main = () => {
  const { view } = useApp();

  switch (view) {
    case 'SPLASH': return <SplashView />;
    case 'LOGIN': return <LoginView />;
    case 'REGISTER': return <RegisterView />;
    case 'ONBOARDING': return <OnboardingView />;
    case 'HOME': return <HomeView />;
    case 'ADD_TRANSACTION': return <AddTransactionView />;
    case 'SETTINGS': return <SettingsView />;
    default: return <SplashView />;
  }
};

const App = () => (
  <AppProvider>
    <Main />
  </AppProvider>
);

const root = createRoot(document.getElementById('root')!);
root.render(<App />);