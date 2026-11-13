import React, { useContext, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Check, ChevronDown, X } from 'lucide-react-native';
import { ThemeContext } from '../context/ThemeContext';

export default function SelectField({ label, value, options, onChange, disabled, placeholder }) {
  const [open, setOpen] = useState(false);
  const { theme } = useContext(ThemeContext);
  const c = theme.colors;
  return <View style={{ marginBottom: 20 }}>
    <Text style={{ fontSize: 12, fontWeight: '700', color: c.text, marginBottom: 8 }}>{label}</Text>
    <TouchableOpacity accessibilityRole="button" accessibilityLabel={`${label}: ${options.find(option => option.value === value)?.label || placeholder}`} accessibilityState={{ disabled, expanded: open }} disabled={disabled} onPress={() => setOpen(true)}
      style={[styles.trigger, { borderColor: c.borderMedium, backgroundColor: disabled ? c.surface : c.card }]}>
      <Text numberOfLines={1} style={{ flex: 1, color: value === '' ? c.textMuted : c.text, fontSize: 14 }}>{options.find(option => option.value === value)?.label || placeholder}</Text><ChevronDown size={18} color={c.textSecondary}/>
    </TouchableOpacity>
    <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
      <View style={styles.overlay}><View accessibilityViewIsModal style={[styles.panel, { backgroundColor: c.card }]}>
        <View style={styles.heading}><Text style={{ fontSize: 20, fontWeight: '800', color: c.text }}>{label}</Text><TouchableOpacity accessibilityLabel={`Close ${label}`} onPress={() => setOpen(false)} style={styles.close}><X size={20} color={c.text}/></TouchableOpacity></View>
        <ScrollView keyboardShouldPersistTaps="handled">{options.map(option => <TouchableOpacity key={option.value} accessibilityRole="button" accessibilityState={{ selected: option.value === value }} onPress={() => { onChange(option.value); setOpen(false); }} style={[styles.option, { backgroundColor: option.value === value ? c.primaryLight : c.card }]}><Text style={{ flex: 1, fontSize: 14, color: c.text, fontWeight: option.value === value ? '700' : '400' }}>{option.label}</Text>{option.value === value && <Check size={18} color={c.primaryDark}/>}</TouchableOpacity>)}</ScrollView>
      </View></View>
    </Modal>
  </View>;
}
const styles = StyleSheet.create({
  trigger: { minHeight: 50, padding: 14, borderWidth: 1, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 12 },
  overlay: { flex: 1, backgroundColor: '#18181899', justifyContent: 'center', alignItems: 'center', padding: 24 },
  panel: { width: '100%', maxWidth: 480, maxHeight: '75%', padding: 16, borderRadius: 16 },
  heading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12 },
  close: { padding: 10 },
  option: { flexDirection: 'row', gap: 12, alignItems: 'center', padding: 16, borderRadius: 8, marginBottom: 4 },
});
