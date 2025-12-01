# Corrections du probleme de persistance

## Problemes identifies

### 1. Race condition au demarrage
Les `useEffect` de sauvegarde se declenchaient **avant** que le chargement initial soit termine, ecrasant les donnees chargees avec les valeurs par defaut.

### 2. Theme darkMode non applique au demarrage
Le theme etait charge depuis le storage mais pas applique immediatement au DOM, causant un flash de theme clair.

### 3. Flag useCustomTable non sauvegarde correctement
Le flag `useCustomTable` etait recalcule automatiquement au lieu d'etre charge depuis le storage, perdant l'etat utilisateur.

### 4. Manque de logs de debug
Impossible de diagnostiquer les problemes de chiffrement/dechiffrement sur mobile.

## Solutions implementees

### 1. Flag isDataLoaded
Ajout d'un flag `isDataLoaded` qui empeche les sauvegardes automatiques pendant le chargement initial:

```typescript
const [isDataLoaded, setIsDataLoaded] = useState<boolean>(false);

// Dans loadData():
finally {
  setIsDataLoaded(true);
  console.log('[DoseMate] Data load complete');
}

// Dans les useEffect de sauvegarde:
useEffect(() => {
  if (!isDataLoaded) return; // Bloque la sauvegarde pendant le chargement
  // ...sauvegarde
}, [carbRatio, darkMode, isDataLoaded]);
```

### 2. Application immediate du theme
Le theme est maintenant applique immediatement au DOM lors du chargement:

```typescript
if (parsed.darkMode !== undefined) {
  setDarkMode(parsed.darkMode);
  // Appliquer immediatement le theme
  if (parsed.darkMode) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}
```

### 3. Sauvegarde et chargement correct de useCustomTable
Le flag est maintenant sauvegarde et charge correctement:

```typescript
// Lors du chargement:
const savedUseCustom = parsed && typeof parsed.useCustom === 'boolean'
  ? parsed.useCustom
  : false;

const hasValues = loadedTable.some((range) =>
  Object.values(range.doses).some((dose) => dose > 0)
);

const shouldUseCustom = savedUseCustom || hasValues;
setUseCustomTable(shouldUseCustom);

// Lors de la sauvegarde:
const customTableData = {
  table: customInsulinTable,
  useCustom: useCustomTable  // Sauvegarde explicite
};
```

### 4. Logs de debug detailles
Ajout de logs prefixes `[DoseMate]` et `[Encryption]` pour faciliter le diagnostic:

```typescript
console.log('[DoseMate] Starting data load...');
console.log('[DoseMate] Custom table parsed:', parsed);
console.log('[DoseMate] UseCustomTable set to:', shouldUseCustom);
console.log('[Encryption] Data encrypted, length:', result.length);
```

## Test sur APK

Pour tester sur mobile:
1. Build l'APK: `npm run build && npx cap sync android && npx cap open android`
2. Ouvrir les Chrome DevTools: chrome://inspect
3. Verifier les logs dans la console
4. Remplir le tableau personnalise
5. Fermer completement l'app (pas juste mettre en arriere-plan)
6. Rouvrir l'app
7. Verifier que les donnees sont preservees

## Verification

Les logs devraient montrer:
```
[DoseMate] Starting data load...
[DoseMate] Meta loaded: {"carbRatio":10,"darkMode":true}
[DoseMate] Custom table raw: exists
[DoseMate] Custom table parsed: {table: [...], useCustom: true}
[DoseMate] Custom table set with 8 ranges
[DoseMate] UseCustomTable set to: true (saved: true, hasValues: true)
[DoseMate] Data load complete
```

Puis lors de la modification:
```
[DoseMate] Saving custom table: {ranges: 8, useCustom: true, hasValues: true}
[Encryption] Data encrypted, length: 1234
[DoseMate] Custom table saved successfully
```

## Notes importantes

- Le chiffrement AES-256 est maintenant plus robuste avec logs
- Les donnees sont preservees meme si le chiffrement echoue
- Le theme s'applique immediatement sans flash
- Le tableau personnalise conserve son etat entre les sessions
