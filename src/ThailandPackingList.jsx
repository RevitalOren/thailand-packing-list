import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Check, User, Palmtree, Sun, Plane, Edit3, Trash2, X, Save, Cloud, CloudOff, Loader } from 'lucide-react';
import localApiService from './services/localApiService.js';

const ThailandPackingList = () => {
  const familyMembers = ['יונתן', 'תמר', 'אילון', 'עמית', 'רויטל'];
  
  const getItemsForMember = (member) => {
    const adultBaseItems = [
      '📄 דרכון + ויזה',
      '✈️ כרטיסי טיסה',
      '🛡️ ביטוח נסיעות',
      '☀️ קרם הגנה SPF 50+',
      '💊 תרופות אישיות',
      '💊 טאבלטים נגד מלריה',
      '🕶️ משקפי שמש',
      '📷 מצלמה',
      '💵 מזומנים (דולרים)',
      '💳 כרטיסי אשראי',
      '📑 צילום דרכון + מסמכים חשובים',
      '💊 פרוביוטיקה לבטן',
      '👔 חולצות צניעות למקדשים',
      '🩳 מכנסיים קצרים (5-6 זוגות)',
      '👕 חולצות (8-10 חולצות)',
      '🩲 תחתונים (7-8 זוגות)',
      '🧦 גרביים (8-10 זוגות)',
      '🩱 בגד ים נוסף'
    ];

    const kidBaseItems = [
      '💊 טאבלטים נגד מלריה',
      '🎒 תיק גב קטן',
      '☀️ קרם הגנה לילדים',
      '🧴 תרופות שהורים נתנו'
    ];

    const commonItems = [
      '👒 כובע',
      '🩱 בגד ים ראשי',
      '👟 סנדלים',
      '👟 נעלי הליכה נוחות',
      '🧻 הדף רטוב',
      '🦟 רפלנט נגד יתושים',
      '🎒 תיק יום',
      '💧 בקבוק מים',
      '🌧️ בגדי גשם קלים',
      '🦷 משחת שיניים',
      '🪥 מברשת שיניים',
      '🧼 ג׳ל אלכוהול לחיטוי ידיים',
      '💊 תרופה לשלשול (אימודיום)',
      '🩹 ערכת עזרה ראשונה',
      '🔋 מטען נייד (פאוור בנק)',
      '🏖️ מגבת מהירת ייבוש',
      '👜 שקית אטומה למים',
      '🔒 מנעול קטן לתיק'
    ];

    const flightItems = [
      '🎧 אוזניות',
      '📱 טאבלט/נייד מלא',
      '🧸 כרית צוואר',
      '🧦 גרביים נוחות',
      '🍬 ממתקים לטיסה',
      '💧 בקבוק מים ריק לטיסה'
    ];

    const kidSpecialItems = [
      '🎮 קונסולת משחק נייד',
      '📚 ספרים/קומיקס',
      '🎨 דפי צביעה ועפרונות',
      '🧩 פאזל קטן',
      '🧸 בובה/חיית מחמד קטנה',
      '🎵 רשימת השמעה במכשיר',
      '🍪 חטיפים בריאים',
      '🕶️ משקפי שמש לילדים',
      '👖 מכנסיים קצרים (5-6 זוגות)',
      '👕 חולצות קצרות (8-9 חולצות)',
      '🩲 תחתונים (7-8 זוגות)',
      '🧦 גרביים (6-8 זוגות)',
      '👗 שמלה/בגד נוח (לבנות)',
      '🩱 בגד ים נוסף',
      '🩴 כפכפים נוחים',
      '🧴 שמפו לילדים',
      '🪥 מברשת שיניים צבעונית',
      '🧼 סבון עדין לילדים',
      '🧸 משחק קטן לכיס',
      '🎭 מדבקות והפתעות קטנות'
    ];

    const adultTechItems = [
      'מטען נייד',
      'מתאם חשמל',
      '⌚ מטען לשעון חכם',
      '⌚ קייס לשעון'
    ];

    const kidTechItems = [
      '🔌 מטען לטלפון/טאבלט',
      '🔌 מתאם חשמל',
      '⌚ קייס לשעון'
    ];

    if (['אילון', 'יונתן', 'תמר'].includes(member)) {
      return [...kidBaseItems, ...commonItems, ...flightItems, ...kidSpecialItems, ...kidTechItems];
    } else {
      return [...adultBaseItems, ...commonItems, ...flightItems, ...adultTechItems];
    }
  };

  // State management
  const [familyData, setFamilyData] = useState(() => {
    const initialData = {};
    familyMembers.forEach(member => {
      const memberItems = getItemsForMember(member);
      initialData[member] = {
        items: memberItems.map((item, index) => ({ name: item, checked: false, id: `${Date.now()}_${index}_${Math.random()}` })),
        newItem: ''
      };
    });
    return initialData;
  });

  const [activeTab, setActiveTab] = useState(familyMembers[0]);
  const [editingItem, setEditingItem] = useState(null);
  const [editText, setEditText] = useState('');
  
  // Google Sheets integration state
  const [isConnected, setIsConnected] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(''); // 'success', 'error', or ''
  const [autoSaveTimeout, setAutoSaveTimeout] = useState(null);

  // Countdown to leaving home — 3.5h before the 13:40 flight on 6 July 2026 = 10:10 (Israel time)
  const LEAVE_HOME = new Date('2026-07-06T10:10:00+03:00').getTime();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  // Emoji reaction overlay — happy when checking, angry when unchecking/deleting
  const [reaction, setReaction] = useState(null); // { type: 'happy' | 'angry', id }
  const showReaction = (type) => {
    setReaction({ type, id: Date.now() });
    setTimeout(() => setReaction((r) => (r && Date.now() - r.id >= 750 ? null : r)), 800);
  };

  const msLeft = LEAVE_HOME - now;
  const cd = {
    days: Math.floor(msLeft / 86400000),
    hours: Math.floor((msLeft % 86400000) / 3600000),
    minutes: Math.floor((msLeft % 3600000) / 60000),
    seconds: Math.floor((msLeft % 60000) / 1000)
  };

  // Initialize local API connection
  useEffect(() => {
    const initializeLocalApi = async () => {
      console.log('Initializing Local API service...');
      
      const success = await localApiService.initialize();
      setIsConnected(success);

      // Always load saved data — loadFamilyData() falls back to localStorage
      // even with no backend, so the list persists across reloads everywhere.
      try {
        const localData = await localApiService.loadFamilyData();
        if (localData) {
          // Filter out metadata fields and use only family member data
          const cleanedData = {};
          Object.entries(localData).forEach(([key, value]) => {
            // Skip metadata fields like lastUpdated, version
            if (familyMembers.includes(key) && value && value.items) {
              cleanedData[key] = {
                items: value.items,
                newItem: value.newItem || ''
              };
            }
          });

          // Update family data with loaded data
          setFamilyData(prevData => {
            const mergedData = { ...prevData };
            Object.entries(cleanedData).forEach(([memberName, memberData]) => {
              if (mergedData[memberName]) {
                mergedData[memberName] = {
                  ...mergedData[memberName],
                  items: memberData.items,
                  newItem: memberData.newItem
                };
              }
            });
            return mergedData;
          });

          showSaveStatus('success', success ? 'נתונים נטענו מהשרת' : 'נתונים נטענו מהמכשיר');
          console.log('Data loaded and merged successfully');
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    initializeLocalApi();
  }, []); // Empty dependency array is correct here

  // Load data from local API
  const loadDataFromLocalApi = async () => {
    try {
      const localData = await localApiService.loadFamilyData();
      if (localData) {
        // Filter out metadata fields and use only family member data
        const cleanedData = {};
        Object.entries(localData).forEach(([key, value]) => {
          // Skip metadata fields like lastUpdated, version
          if (familyMembers.includes(key) && value && value.items) {
            cleanedData[key] = {
              items: value.items,
              newItem: value.newItem || ''
            };
          }
        });
        
        // Merge with current familyData structure, preserving existing members not in saved data
        const mergedData = { ...familyData };
        Object.entries(cleanedData).forEach(([memberName, memberData]) => {
          if (mergedData[memberName]) {
            mergedData[memberName] = {
              ...mergedData[memberName],
              items: memberData.items,
              newItem: memberData.newItem
            };
          }
        });
        
        setFamilyData(mergedData);
        showSaveStatus('success', 'נתונים נטענו מהשרת');
        console.log('Data loaded and merged successfully from local API');
      }
    } catch (error) {
      console.error('Error loading data:', error);
      showSaveStatus('error', 'שגיאה בטעינת נתונים');
    }
  };

  // Save data to local API with debouncing
  const saveDataToLocalApi = useCallback(async () => {
    setIsSaving(true);
    try {
      // saveFamilyData always writes to localStorage; backend is best-effort.
      const backendOk = await localApiService.saveFamilyData(familyData);
      showSaveStatus('success', backendOk ? 'נשמר בהצלחה' : 'נשמר במכשיר');
    } catch (error) {
      console.error('Error saving data:', error);
      showSaveStatus('error', 'שגיאה בשמירה');
    } finally {
      setIsSaving(false);
    }
  }, [familyData]);

  // Debounced auto-save with current data
  const scheduleAutoSaveWithData = useCallback((dataToSave) => {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    const timeout = setTimeout(async () => {
      setIsSaving(true);
      try {
        // Always persist — localStorage works even with no backend.
        const backendOk = await localApiService.saveFamilyData(dataToSave);
        showSaveStatus('success', backendOk ? 'נשמר בהצלחה' : 'נשמר במכשיר');
      } catch (error) {
        console.error('Error saving data:', error);
        showSaveStatus('error', 'שגיאה בשמירה');
      } finally {
        setIsSaving(false);
      }
    }, 2000); // 2 second delay for auto-save

    setAutoSaveTimeout(timeout);
  }, [autoSaveTimeout]);

  // Debounced auto-save (legacy - uses current familyData state)
  const scheduleAutoSave = useCallback(() => {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    const timeout = setTimeout(() => {
      saveDataToLocalApi();
    }, 2000); // 2 second delay for auto-save

    setAutoSaveTimeout(timeout);
  }, [saveDataToLocalApi]); // Remove autoSaveTimeout from dependencies to avoid recreation

  // Show save status message
  const showSaveStatus = (type, message) => {
    setSaveStatus(type);
    setTimeout(() => setSaveStatus(''), 3000);
  };

  // Manual save function
  const handleManualSave = async () => {
    await saveDataToLocalApi();
  };

  // Modified toggle function with auto-save
  const toggleItem = (member, itemId) => {
    const wasChecked = familyData[member].items.find(i => i.id === itemId)?.checked;
    showReaction(wasChecked ? 'angry' : 'happy');
    setFamilyData(prev => {
      const newData = {
        ...prev,
        [member]: {
          ...prev[member],
          items: prev[member].items.map(item =>
            item.id === itemId ? { ...item, checked: !item.checked } : item
          )
        }
      };
      
      // Schedule auto-save with the new data
      setTimeout(() => {
        scheduleAutoSaveWithData(newData);
      }, 100);
      
      return newData;
    });
  };

  // Modified delete function with auto-save
  const deleteItem = (member, itemId) => {
    showReaction('angry');
    setFamilyData(prev => {
      const newData = {
        ...prev,
        [member]: {
          ...prev[member],
          items: prev[member].items.filter(item => item.id !== itemId)
        }
      };
      
      // Schedule auto-save with new data
      setTimeout(() => {
        scheduleAutoSaveWithData(newData);
      }, 100);
      
      return newData;
    });
  };

  const startEditing = (member, itemId, currentText) => {
    setEditingItem({ member, itemId });
    setEditText(currentText);
  };

  const saveEdit = () => {
    if (editText.trim() && editingItem) {
      setFamilyData(prev => {
        const newData = {
          ...prev,
          [editingItem.member]: {
            ...prev[editingItem.member],
            items: prev[editingItem.member].items.map(item =>
              item.id === editingItem.itemId ? { ...item, name: editText.trim() } : item
            )
          }
        };
        
        // Schedule auto-save with new data
        setTimeout(() => {
          scheduleAutoSaveWithData(newData);
        }, 100);
        
        return newData;
      });
    }
    setEditingItem(null);
    setEditText('');
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setEditText('');
  };

  const addItem = (member) => {
    const newItemText = familyData[member].newItem.trim();
    if (newItemText) {
      setFamilyData(prev => {
        const newData = {
          ...prev,
          [member]: {
            ...prev[member],
            items: [...prev[member].items, { name: newItemText, checked: false, id: `${Date.now()}_${Math.random()}` }],
            newItem: ''
          }
        };
        
        // Schedule auto-save with new data
        setTimeout(() => {
          scheduleAutoSaveWithData(newData);
        }, 100);
        
        return newData;
      });
    }
  };

  const updateNewItem = (member, value) => {
    setFamilyData(prev => ({
      ...prev,
      [member]: {
        ...prev[member],
        newItem: value
      }
    }));
  };

  const getProgress = (member) => {
    const items = familyData[member].items;
    const checkedItems = items.filter(item => item.checked).length;
    return items.length > 0 ? Math.round((checkedItems / items.length) * 100) : 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-pink-100 to-purple-200 p-4">
      {/* Emoji reaction overlay */}
      {reaction && (
        <div
          key={reaction.id}
          className={`reaction-overlay ${reaction.type === 'happy' ? 'reaction-happy' : 'reaction-angry'}`}
        >
          <span className="reaction-emoji">{reaction.type === 'happy' ? '😄' : '😠'}</span>
        </div>
      )}

      {/* Floating tropical background decorations */}
      <span className="floaty text-6xl" style={{ top: '12%', left: '4%' }}>🌴</span>
      <span className="floaty text-5xl" style={{ top: '35%', right: '3%', animationDelay: '1.2s' }}>🏝️</span>
      <span className="floaty text-5xl" style={{ top: '62%', left: '5%', animationDelay: '2.4s' }}>🐘</span>
      <span className="floaty text-4xl" style={{ top: '80%', right: '6%', animationDelay: '0.6s' }}>🍍</span>
      <span className="floaty text-4xl" style={{ top: '50%', left: '45%', animationDelay: '3s' }}>🌺</span>
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8 bg-gradient-to-r from-fuchsia-500 via-orange-400 to-amber-400 rounded-3xl shadow-2xl p-8 text-white">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Plane className="text-white w-9 h-9 drop-shadow wiggle" />
            <h1 className="text-4xl font-extrabold drop-shadow-lg">טיול תאילנד 🇹🇭</h1>
            <Palmtree className="text-white w-9 h-9 drop-shadow" />
          </div>
          <p className="text-white/95 text-lg font-medium">רשימת חפצים לשלושה שבועות של הרפתקאות 🌴☀️🏝️</p>
          <a
            href="/plan.html"
            className="inline-flex items-center gap-2 mt-4 bg-white text-pink-600 font-bold px-6 py-2.5 rounded-full shadow-lg hover:scale-105 transition-transform"
          >
            📅 לתוכנית הטיול המלאה
          </a>

          {/* Countdown to leaving home */}
          <div className="mt-5 bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-3 w-fit mx-auto">
            <div className="text-xs text-white/90 font-medium mb-2">⏳ יציאה מהבית (3.5 שעות לפני הטיסה) · 6.7 בשעה 10:10</div>
            {msLeft > 0 ? (
              <div className="flex items-center justify-center gap-2 sm:gap-3" dir="ltr">
                {[
                  { v: cd.days, l: 'ימים' },
                  { v: cd.hours, l: 'שעות' },
                  { v: cd.minutes, l: 'דקות' },
                  { v: cd.seconds, l: 'שניות' }
                ].map((u, i) => (
                  <div key={i} className="bg-white/90 rounded-xl px-2.5 py-1.5 min-w-[52px] shadow">
                    <div className="text-2xl font-extrabold text-pink-600 leading-none tabular-nums">{String(u.v).padStart(2, '0')}</div>
                    <div className="text-[10px] text-gray-500 font-medium mt-0.5">{u.l}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-lg font-extrabold text-white">🎉 יוצאים לדרך! בטיסה נעימה ✈️</div>
            )}
          </div>
          <div className="flex items-center justify-center gap-2 mt-3 bg-white/20 rounded-full px-4 py-1.5 w-fit mx-auto backdrop-blur-sm">
            <Sun className="text-yellow-200 w-5 h-5" />
            <span className="text-sm text-white/95 font-medium">זכרו: מזג אוויר חם ולח, בדקו את כל הפריטים!</span>
          </div>
          
          {/* Cloud sync status */}
          <div className="flex items-center justify-center gap-2 mt-4 p-2 rounded-full bg-white/20 backdrop-blur-sm w-fit mx-auto">
            {isConnected ? (
              <>
                <Cloud className="w-4 h-4 text-green-200" />
                <span className="text-xs text-white font-medium">מחובר לשרת</span>
                {isSaving && <Loader className="w-4 h-4 animate-spin text-white" />}
                <button
                  onClick={handleManualSave}
                  disabled={isSaving}
                  className="ml-2 px-3 py-1 text-xs bg-white/90 text-pink-600 font-bold rounded-full hover:bg-white disabled:opacity-50"
                >
                  שמור עכשיו
                </button>
              </>
            ) : (
              <>
                <CloudOff className="w-4 h-4 text-white/70" />
                <span className="text-xs text-white/80 font-medium">💾 נשמר במכשיר</span>
              </>
            )}
          </div>

          {/* Save status notification */}
          {saveStatus && (
            <div className={`mt-2 px-3 py-1 rounded text-xs ${
              saveStatus === 'success' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {saveStatus === 'success' ? '✅ נשמר בהצלחה' : '❌ שגיאה בשמירה'}
            </div>
          )}
        </div>

        {/* Family Overview */}
        {(() => {
          const totals = familyMembers.reduce((acc, m) => {
            const items = familyData[m].items;
            acc.total += items.length;
            acc.checked += items.filter(i => i.checked).length;
            return acc;
          }, { total: 0, checked: 0 });
          const overall = totals.total ? Math.round((totals.checked / totals.total) * 100) : 0;
          return (
            <div className="bg-white/90 backdrop-blur rounded-3xl shadow-xl p-5 mb-6 border-4 border-white">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-extrabold flex items-center gap-2"><span>📊</span><span className="bg-gradient-to-r from-pink-600 to-orange-500 bg-clip-text text-transparent">סקירת המשפחה</span></h2>
                <span className="text-sm font-bold text-gray-600">{totals.checked}/{totals.total} פריטים · {overall}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                <div className="bg-gradient-to-r from-green-400 via-yellow-400 to-orange-500 h-4 rounded-full transition-all duration-500 shadow" style={{ width: `${overall}%` }}></div>
              </div>
              <div className="grid gap-2">
                {familyMembers.map(m => {
                  const p = getProgress(m);
                  const isKid = ['אילון', 'יונתן', 'תמר'].includes(m);
                  return (
                    <button key={m} onClick={() => setActiveTab(m)} className="flex items-center gap-3 text-right hover:bg-pink-50 rounded-xl p-1.5 transition-colors">
                      <span className="w-20 shrink-0 font-bold text-gray-700 flex items-center gap-1">{isKid ? '🧒' : '🧳'} {m}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                        <div className={`h-2.5 rounded-full transition-all duration-500 ${p === 100 ? 'bg-green-500' : 'bg-gradient-to-r from-pink-400 to-orange-400'}`} style={{ width: `${p}%` }}></div>
                      </div>
                      <span className="w-12 shrink-0 text-xs font-bold text-gray-500 tabular-nums">{p === 100 ? '✅' : `${p}%`}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* Family Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {familyMembers.map(member => {
            const progress = getProgress(member);
            const isKid = ['אילון', 'יונתן', 'תמר'].includes(member);
            return (
              <button
                key={member}
                onClick={() => setActiveTab(member)}
                className={`px-6 py-3 rounded-2xl font-bold transition-all duration-200 flex items-center gap-2 ${
                  activeTab === member
                    ? 'bg-gradient-to-r from-pink-500 to-orange-400 text-white shadow-xl scale-110 ring-2 ring-white'
                    : 'bg-white text-gray-700 hover:bg-pink-50 hover:scale-105 shadow-md hover:shadow-lg'
                }`}
              >
                {isKid ? '🧒' : <User className="w-4 h-4" />}
                <span>{member}</span>
                <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                  activeTab === member ? 'bg-white/30 text-white' : 'bg-gradient-to-r from-pink-100 to-orange-100 text-pink-600'
                }`}>
                  {progress}%
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Member's List */}
        <div className="bg-white/90 backdrop-blur rounded-3xl shadow-2xl p-6 border-4 border-white">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-extrabold flex items-center gap-3">
              {['אילון', 'יונתן', 'תמר'].includes(activeTab) ? <span>🧒</span> : <User className="text-pink-500" />}
              <span className="bg-gradient-to-r from-pink-600 to-orange-500 bg-clip-text text-transparent">רשימת {activeTab}</span>
              {['אילון', 'יונתן', 'תמר'].includes(activeTab) &&
                <span className="text-lg">🎮✈️</span>
              }
            </h2>
            <div className="text-sm text-gray-500">
              {familyData[activeTab].items.filter(item => item.checked).length} מתוך {familyData[activeTab].items.length} פריטים
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>התקדמות</span>
              <span className="font-bold">{getProgress(activeTab) === 100 ? '🎉 הכל ארוז!' : `${getProgress(activeTab)}% הושלם`}</span>
            </div>
            <div className="relative w-full bg-gray-200 rounded-full h-5" dir="ltr">
              <div
                className="bg-gradient-to-r from-green-400 via-yellow-400 to-orange-500 h-5 rounded-full transition-all duration-700 shadow-md"
                style={{ width: `${getProgress(activeTab)}%` }}
              ></div>
              <span
                className="absolute top-1/2 -translate-y-1/2 text-xl transition-all duration-700 drop-shadow"
                style={{ left: `calc(${getProgress(activeTab)}% - 14px)` }}
              >✈️</span>
              <span className="absolute top-1/2 -translate-y-1/2 right-1 text-sm">🇹🇭</span>
            </div>
          </div>

          {/* Add New Item */}
          <div className="mb-6 flex gap-2">
            <input
              type="text"
              placeholder="הוסף פריט חדש לרשימה..."
              value={familyData[activeTab].newItem}
              onChange={(e) => updateNewItem(activeTab, e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addItem(activeTab)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              dir="rtl"
            />
            <button
              onClick={() => addItem(activeTab)}
              className="px-6 py-3 bg-gradient-to-r from-teal-500 to-green-500 text-white rounded-2xl hover:from-teal-600 hover:to-green-600 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg font-bold"
            >
              <Plus className="w-4 h-4" />
              הוסף
            </button>
          </div>

          {/* Items List */}
          <div className="grid gap-2">
            {familyData[activeTab].items.map((item, idx) => (
              <div
                key={item.id}
                className={`item-row p-4 rounded-2xl border-2 transition-all duration-200 ${
                  item.checked
                    ? 'bg-gradient-to-r from-green-100 to-emerald-50 border-green-300 text-green-800'
                    : 'bg-white border-pink-100 text-gray-700 hover:border-orange-300 hover:shadow-md hover:-translate-y-0.5'
                }`}
                style={{ animationDelay: `${Math.min(idx * 30, 600)}ms` }}
              >
                {editingItem?.itemId === item.id ? (
                  // Edit Mode
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                      className="flex-1 px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      dir="rtl"
                      autoFocus
                    />
                    <button
                      onClick={saveEdit}
                      className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  // Normal Mode
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        onClick={() => toggleItem(activeTab, item.id)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 cursor-pointer ${
                          item.checked
                            ? 'bg-green-500 border-green-500 check-pop'
                            : 'border-gray-300 hover:border-pink-500 hover:scale-110'
                        }`}
                      >
                        {item.checked && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <span 
                        onClick={() => toggleItem(activeTab, item.id)}
                        className={`font-medium cursor-pointer flex-1 ${item.checked ? 'line-through' : ''}`}
                      >
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEditing(activeTab, item.id, item.name)}
                        className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg transition-colors"
                        title="ערוך פריט"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteItem(activeTab, item.id)}
                        className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                        title="מחק פריט"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {familyData[activeTab].items.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Palmtree className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>אין פריטים ברשימה. הוסיפו את הפריט הראשון!</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>💡 טיפ: לחצו על ✅ כדי לסמן שארזתם, על ✏️ לערוך, ועל 🗑️ למחוק</p>
          <p className="mt-1">🌴 בטיח פנטסטי בתאילנד! 🌴</p>
          {isConnected && (
            <p className="mt-2 text-xs text-green-600">💾 השינויים נשמרים אוטומטית בשרת מקומי</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThailandPackingList;