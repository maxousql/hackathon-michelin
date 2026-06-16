import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type {
  BuybackEstimate,
  BuybackInput,
  BuybackRequest,
} from '@michelin/contracts';

import type { Environment } from '../../config/environment';
import { estimateBuyback } from './buyback.estimate';

interface ProductRow {
  segment: string | null;
  web_product_designation: string | null;
  designation: string | null;
  web_range_name: string | null;
}

@Injectable()
export class BuybackService {
  private readonly supabase: SupabaseClient;

  constructor(config: ConfigService<Environment, true>) {
    this.supabase = createClient(
      config.get('SUPABASE_URL', { infer: true }),
      config.get('SUPABASE_SERVICE_ROLE_KEY', { infer: true }),
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
  }

  /** Estimation de reprise pour un pneu du catalogue + un état. */
  async estimate(input: BuybackInput): Promise<BuybackEstimate> {
    const product = await this.findProduct(input.productId);
    const label = this.labelOf(product);
    const amountEur = estimateBuyback(
      product.segment,
      input.condition,
      input.quantity,
    );
    return { amountEur, productLabel: label, segment: product.segment };
  }

  /** Crée une demande de reprise pour l'utilisateur courant. */
  async create(userId: string, input: BuybackInput): Promise<BuybackRequest> {
    const product = await this.findProduct(input.productId);
    const label = this.labelOf(product);
    const amount = estimateBuyback(
      product.segment,
      input.condition,
      input.quantity,
    );

    const { data, error } = await this.supabase
      .from('buyback_requests')
      .insert({
        user_id: userId,
        product_id: input.productId,
        product_label: label,
        segment: product.segment,
        condition: input.condition,
        quantity: input.quantity,
        estimated_amount_eur: amount,
      })
      .select(
        'id, product_id, product_label, segment, condition, quantity, estimated_amount_eur, status, created_at',
      )
      .single();

    if (error || !data) {
      throw new Error(
        `Création de la demande impossible : ${error?.message ?? 'inconnue'}`,
      );
    }

    return data as unknown as BuybackRequest;
  }

  /** Demandes de reprise de l'utilisateur courant, les plus récentes d'abord. */
  async listMine(userId: string): Promise<BuybackRequest[]> {
    const { data, error } = await this.supabase
      .from('buyback_requests')
      .select(
        'id, product_id, product_label, segment, condition, quantity, estimated_amount_eur, status, created_at',
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Lecture des demandes impossible : ${error.message}`);
    }

    return (data ?? []) as unknown as BuybackRequest[];
  }

  private async findProduct(productId: number): Promise<ProductRow> {
    const { data, error } = await this.supabase
      .from('michelin_products')
      .select('segment, web_product_designation, designation, web_range_name')
      .eq('id', productId)
      .maybeSingle();

    if (error) {
      throw new Error(`Lecture du produit impossible : ${error.message}`);
    }
    if (!data) {
      throw new NotFoundException(`Product ${productId} not found.`);
    }
    return data as unknown as ProductRow;
  }

  private labelOf(product: ProductRow): string {
    return (
      product.web_product_designation?.trim() ||
      product.designation?.trim() ||
      product.web_range_name?.trim() ||
      'Pneu MICHELIN'
    );
  }
}
