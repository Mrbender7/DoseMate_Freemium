import React, { useState, useEffect, useCallback, forwardRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, collection, query, where, serverTimestamp } from 'firebase/firestore';
import { Plus, Minus, User, List, Loader2, Save } from 'lucide-react';

// --- Configuration Firebase ---

const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// Utility pour générer un ID unique simple
const generateUniqueId = () => Date.now().toString() + Math.random().toString(36).substring(2, 9);

// --- Hooks Firebase & Persistance ---

const useFirebase = () => {
  const [db, setDb] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    if (!firebaseConfig.apiKey) return;

    const app = initializeApp(firebaseConfig);
    const firestore = getFirestore(app);
    const authentication = getAuth(app);

    setDb(firestore);

    const unsubscribe = onAuthStateChanged(authentication, async (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        try {
          if (initialAuthToken) {
            await signInWithCustomToken(authentication, initialAuthToken);
          } else {
            await signInAnonymously(authentication);
          }
        } catch (error) {
          console.error("Échec de la connexion Firebase:", error);
          setUserId('anon-' + generateUniqueId());
        }
      }
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  const privateDocRef = useCallback((docName) => {
    if (!db || !userId) return null;
    return doc(db, `artifacts/${appId}/users/${userId}/appData/${docName}`);
  }, [db, userId]);

  return { db, userId, isAuthReady, privateDocRef };
};

const useAppState = ({ db, userId, isAuthReady, privateDocRef }) => {
  const [data, setData] = useState({ count: 0, items: [] });

  // 1. Charger les données (Lecture en temps réel)
  useEffect(() => {
    if (!isAuthReady || !userId || !db) return;

    const docRef = privateDocRef('userState');
    if (!docRef) return;

    // Écouter les changements en temps réel
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const fetchedData = docSnap.data();
        setData({
          count: fetchedData.count || 0,
          // S'assurer que les éléments sont un tableau
          items: fetchedData.items && Array.isArray(fetchedData.items) ? fetchedData.items : [],
        });
        console.log("État chargé depuis Firestore.");
      } else {
        // Document n'existe pas, initialiser dans l'état local
        setData({ count: 0, items: [] });
      }
    }, (error) => {
      console.error("Erreur de récupération Firestore:", error);
    });

    return () => unsubscribe();
  }, [db, userId, isAuthReady, privateDocRef]);

  // 2. Sauvegarder les données
  const saveState = useCallback(async (newState) => {
    if (!db || !userId) return;
    const docRef = privateDocRef('userState');
    if (!docRef) return;

    try {
      await setDoc(docRef, { ...newState, timestamp: serverTimestamp() }, { merge: true });
      setData(newState); // Mettre à jour l'état local après la sauvegarde
      console.log("État sauvegardé dans Firestore.");
    } catch (error) {
      console.error("Erreur de sauvegarde Firestore:", error);
    }
  }, [db, userId, privateDocRef]);

  // Méthodes de mutation qui appellent saveState
  const increment = useCallback(() => {
    const newState = { ...data, count: data.count + 1 };
    saveState(newState);
  }, [data, saveState]);

  const decrement = useCallback(() => {
    const newState = { ...data, count: data.count - 1 };
    saveState(newState);
  }, [data, saveState]);

  const addItem = useCallback((text) => {
    const newItem = { id: generateUniqueId(), text, createdAt: new Date().toISOString() };
    const newState = { ...data, items: [...data.items, newItem] };
    saveState(newState);
  }, [data, saveState]);

  const removeItem = useCallback((id) => {
    const newState = { ...data, items: data.items.filter(item => item.id !== id) };
    saveState(newState);
  }, [data, saveState]);


  return { ...data, increment, decrement, addItem, removeItem };
};


// --- Composants Shadcn/ui Simplifiés ---

const cn = (...classes: (string | boolean | undefined | null)[]) => classes.filter(Boolean).join(' ');

// L'erreur de ref dans Card et ses sous-composants a été corrigée en utilisant forwardRef
const Card = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border bg-white/70 backdrop-blur-sm text-card-foreground shadow-lg transition-all hover:shadow-xl",
      className
    )}
    {...props}
  >
    {children}
  </div>
));
Card.displayName = "Card";

const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  >
    {children}
  </div>
));
CardHeader.displayName = "CardHeader";

const CardTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-2xl font-bold leading-none tracking-tight", className)}
    {...props}
  >
    {children}
  </h3>
));
CardTitle.displayName = "CardTitle";

const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props}>
    {children}
  </div>
));
CardContent.displayName = "CardContent";

const Button = forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'outline' | 'destructive' }>(({ className, variant = 'default', children, ...props }, ref) => {
  const baseClasses = "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none shadow-md";
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700 p-2 h-10",
    outline: "border border-blue-500 text-blue-600 hover:bg-blue-50 p-2 h-10",
    destructive: "bg-red-600 text-white hover:bg-red-700 p-2 h-10",
  };

  return (
    <button
      ref={ref}
      className={cn(baseClasses, variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
});
Button.displayName = "Button";

const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, type = 'text', ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(
      "flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";


// --- Composants de l'Application ---

const Counter = ({ count, onIncrement, onDecrement }) => (
  <Card className="shadow-2xl">
    <CardHeader>
      <CardTitle className="flex items-center text-gray-800">Compteur Persistant</CardTitle>
    </CardHeader>
    <CardContent className="flex flex-col items-center space-y-4">
      <div className="text-7xl font-extrabold text-blue-600">{count}</div>
      <div className="flex space-x-4 w-full">
        <Button onClick={onDecrement} className="flex-1" variant="outline">
          <Minus className="w-4 h-4 mr-2" /> Décrémenter
        </Button>
        <Button onClick={onIncrement} className="flex-1">
          <Plus className="w-4 h-4 mr-2" /> Incrémenter
        </Button>
      </div>
    </CardContent>
  </Card>
);

const ItemList = ({ items, onAddItem, onRemoveItem }) => {
  const [inputText, setInputText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputText.trim()) {
      onAddItem(inputText.trim());
      setInputText('');
    }
  };

  return (
    <Card className="mt-8 shadow-2xl">
      <CardHeader>
        <CardTitle className="flex items-center text-gray-800">
          <List className="w-6 h-6 mr-2 text-blue-600" /> Liste d'Éléments
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ajouter un nouvel élément..."
          />
          <Button type="submit" className="w-24 flex-shrink-0">
            <Plus className="w-4 h-4" /> Ajouter
          </Button>
        </form>

        {items.length === 0 ? (
          <p className="text-gray-500 italic text-center py-4">La liste est vide. Ajoutez quelque chose !</p>
        ) : (
          <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {items.map(item => (
              <li key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
                <span className="text-gray-700">{item.text}</span>
                <Button
                  variant="destructive"
                  onClick={() => onRemoveItem(item.id)}
                  className="h-7 px-2"
                >
                  Supprimer
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};


// --- Composant Principal App ---

const App = () => {
  const { db, userId, isAuthReady, privateDocRef } = useFirebase();
  const { count, items, increment, decrement, addItem, removeItem } = useAppState({ db, userId, isAuthReady, privateDocRef });

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center p-8 bg-white/90 rounded-xl shadow-2xl">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          <p className="mt-4 text-gray-700 font-semibold">Connexion à Firebase en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8 font-sans">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-gray-800">
          Application de Test Persistant
        </h1>
        <p className="text-lg text-gray-600 mt-2 flex items-center justify-center">
          <Save className="w-5 h-5 mr-2 text-green-500" /> État enregistré dans Firestore.
        </p>
      </header>

      <div className="max-w-xl mx-auto">
        <Counter
          count={count}
          onIncrement={increment}
          onDecrement={decrement}
        />

        <ItemList
          items={items}
          onAddItem={addItem}
          onRemoveItem={removeItem}
        />
      </div>

      <footer className="mt-12 text-center text-xs text-gray-500 p-4 border-t border-gray-300">
        <p className="flex items-center justify-center">
          <User className="w-4 h-4 mr-1" />
          ID Utilisateur Firestore: <span className="ml-1 font-mono text-gray-700 break-all">{userId}</span>
        </p>
        <p className="mt-1">Toutes les données sont persistantes et synchronisées en temps réel.</p>
      </footer>
    </div>
  );
};

export default App;