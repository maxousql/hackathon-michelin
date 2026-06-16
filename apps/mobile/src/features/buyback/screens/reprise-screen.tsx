import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type {
  BuybackCondition,
  BuybackRequest,
  ProductListItem,
} from '@michelin/contracts';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../../../components/app-button';
import { AppTextInput } from '../../../components/app-text-input';
import { ScreenWrapper } from '../../../components/screen-wrapper';
import type { AppStackParamList } from '../../../navigation/types';
import { colors, fontSize, fontWeight, radius, spacing } from '../../../theme';
import { useAuth } from '../../auth/context/auth-context';
import { Chip } from '../../products/components/chip';
import { productName, productSize } from '../../products/presenter';
import { buybackClient } from '../api';
import { estimateBuyback } from '../estimate';
import {
  CONDITION_HINTS,
  CONDITION_LABELS,
  CONDITION_ORDER,
  STATUS_LABELS,
  formatEuros,
} from '../labels';

type Props = NativeStackScreenProps<AppStackParamList, 'Reprise'>;

type Feedback = { type: 'error' | 'success'; text: string };

export function RepriseScreen({ navigation }: Props) {
  const { token } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ProductListItem[]>([]);
  const [selected, setSelected] = useState<ProductListItem | null>(null);
  const [condition, setCondition] = useState<BuybackCondition>('good');
  const [quantity, setQuantity] = useState('1');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [requests, setRequests] = useState<BuybackRequest[]>([]);

  useEffect(() => {
    if (!token) return;
    let active = true;
    buybackClient
      .getMyBuybackRequests(token)
      .then((data) => {
        if (active) setRequests(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [token]);

  useEffect(() => {
    if (selected) return;
    const q = query.trim();
    const handle = setTimeout(() => {
      if (q.length < 2) {
        setResults([]);
        return;
      }
      buybackClient
        .getProducts({ q, sort: 'range', page: 1 })
        .then((res) => setResults(res.items.slice(0, 8)))
        .catch(() => setResults([]));
    }, 300);
    return () => clearTimeout(handle);
  }, [query, selected]);

  const qty = Math.max(1, Number(quantity) || 1);
  const estimate = selected
    ? estimateBuyback(selected.segment, condition, qty)
    : null;

  async function submit() {
    if (!selected || !token || submitting) return;
    setSubmitting(true);
    setFeedback(null);
    try {
      const created = await buybackClient.createBuybackRequest(token, {
        productId: selected.id,
        condition,
        quantity: qty,
      });
      setRequests((prev) => [created, ...prev]);
      setFeedback({
        type: 'success',
        text: `Demande envoyée ! MICHELIN vous reprend ce pneu pour ${formatEuros(created.estimated_amount_eur)}.`,
      });
      setSelected(null);
      setQuery('');
    } catch (err: unknown) {
      setFeedback({
        type: 'error',
        text: err instanceof Error ? err.message : 'La demande a échoué.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScreenWrapper>
      <Text style={styles.eyebrow}>SECONDE VIE</Text>
      <Text style={styles.title}>Reprise MICHELIN</Text>
      <Text style={styles.lede}>
        Donnez une seconde vie à vos pneus : MICHELIN vous les reprend pour les
        remettre à neuf ou les recycler, et vous récompense.
      </Text>

      {selected ? (
        <View style={styles.selected}>
          <View style={styles.flex}>
            <Text style={styles.selectedName}>{productName(selected)}</Text>
            {productSize(selected) ? (
              <Text style={styles.selectedMeta}>{productSize(selected)}</Text>
            ) : null}
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setSelected(null);
              setQuery('');
            }}
          >
            <Text style={styles.change}>Changer</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.search}>
          <AppTextInput
            label="Votre modèle de pneu"
            value={query}
            onChangeText={setQuery}
            placeholder="Rechercher dans le catalogue…"
            autoCapitalize="none"
          />
          {results.map((tire) => (
            <Pressable
              key={tire.id}
              accessibilityRole="button"
              style={styles.result}
              onPress={() => {
                setSelected(tire);
                setResults([]);
              }}
            >
              <Text style={styles.resultName}>{productName(tire)}</Text>
              {productSize(tire) ? (
                <Text style={styles.resultMeta}>{productSize(tire)}</Text>
              ) : null}
            </Pressable>
          ))}
        </View>
      )}

      {selected ? (
        <View style={styles.form}>
          <Text style={styles.label}>État du pneu</Text>
          <View style={styles.conditions}>
            {CONDITION_ORDER.map((value) => (
              <Chip
                key={value}
                label={CONDITION_LABELS[value]}
                selected={condition === value}
                onPress={() => setCondition(value)}
              />
            ))}
          </View>
          <Text style={styles.hint}>{CONDITION_HINTS[condition]}</Text>

          <AppTextInput
            label="Quantité"
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="number-pad"
          />

          {estimate !== null ? (
            <View style={styles.estimate}>
              <Text style={styles.estimateLabel}>Reprise estimée</Text>
              <Text style={styles.estimateAmount}>{formatEuros(estimate)}</Text>
            </View>
          ) : null}

          {feedback ? (
            <Text
              style={feedback.type === 'error' ? styles.error : styles.success}
            >
              {feedback.text}
            </Text>
          ) : null}

          <AppButton
            title="Demander la reprise"
            loadingTitle="Envoi…"
            onPress={submit}
            loading={submitting}
          />
        </View>
      ) : null}

      <Text style={styles.sectionTitle}>Mes demandes</Text>
      {requests.length === 0 ? (
        <Text style={styles.empty}>Aucune demande pour le moment.</Text>
      ) : (
        requests.map((request) => (
          <View key={request.id} style={styles.requestItem}>
            <View style={styles.flex}>
              <Text style={styles.requestName}>{request.product_label}</Text>
              <Text style={styles.requestMeta}>
                {CONDITION_LABELS[request.condition]} · ×{request.quantity}
              </Text>
            </View>
            <View style={styles.requestRight}>
              <Text style={styles.requestAmount}>
                {formatEuros(request.estimated_amount_eur)}
              </Text>
              <Text style={styles.requestStatus}>
                {STATUS_LABELS[request.status]}
              </Text>
            </View>
          </View>
        ))
      )}

      <View style={styles.back}>
        <AppButton
          title="Retour"
          variant="outline"
          onPress={() => navigation.goBack()}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  eyebrow: {
    color: colors.brandBlue,
    fontSize: fontSize.caption,
    fontWeight: fontWeight.black,
    letterSpacing: 2,
  },
  title: {
    marginTop: spacing[2],
    color: colors.textPrimary,
    fontSize: fontSize.h1,
    fontWeight: fontWeight.black,
    letterSpacing: -1,
  },
  lede: {
    marginTop: spacing[3],
    marginBottom: spacing[6],
    color: colors.textSecondary,
    fontSize: fontSize.bodyLarge,
    lineHeight: 26,
  },
  search: { gap: spacing[2] },
  result: {
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.medium,
    backgroundColor: colors.surfaceDefault,
  },
  resultName: { color: colors.textPrimary, fontWeight: fontWeight.bold },
  resultMeta: {
    marginTop: spacing[1],
    color: colors.textSecondary,
    fontSize: fontSize.bodySmall,
  },
  selected: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.brandBlue,
    borderRadius: radius.medium,
    backgroundColor: 'rgba(39,80,155,0.06)',
  },
  selectedName: { color: colors.textPrimary, fontWeight: fontWeight.bold },
  selectedMeta: {
    marginTop: spacing[1],
    color: colors.textSecondary,
    fontSize: fontSize.bodySmall,
  },
  change: { color: colors.brandBlue, fontWeight: fontWeight.bold },
  form: { marginTop: spacing[6], gap: spacing[4] },
  label: {
    fontSize: fontSize.bodySmall,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  conditions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  hint: { color: colors.textSecondary, fontSize: fontSize.bodySmall },
  estimate: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing[4],
    borderRadius: radius.medium,
    backgroundColor: colors.surfaceHighlight,
  },
  estimateLabel: { color: colors.textOnYellow, fontWeight: fontWeight.bold },
  estimateAmount: {
    color: colors.textOnYellow,
    fontSize: fontSize.h3,
    fontWeight: fontWeight.black,
  },
  error: { color: colors.stateError, fontSize: fontSize.bodySmall },
  success: { color: colors.stateSuccess, fontSize: fontSize.bodySmall },
  sectionTitle: {
    marginTop: spacing[10],
    marginBottom: spacing[3],
    color: colors.textPrimary,
    fontSize: fontSize.h3,
    fontWeight: fontWeight.black,
  },
  empty: { color: colors.textSecondary },
  requestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
    padding: spacing[4],
    marginBottom: spacing[2],
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.medium,
    backgroundColor: colors.surfaceDefault,
  },
  requestName: { color: colors.textPrimary, fontWeight: fontWeight.bold },
  requestMeta: {
    marginTop: spacing[1],
    color: colors.textSecondary,
    fontSize: fontSize.bodySmall,
  },
  requestRight: { alignItems: 'flex-end', gap: spacing[1] },
  requestAmount: {
    color: colors.textPrimary,
    fontSize: fontSize.h4,
    fontWeight: fontWeight.black,
  },
  requestStatus: { color: colors.textSecondary, fontSize: fontSize.caption },
  back: { marginTop: spacing[8] },
});
