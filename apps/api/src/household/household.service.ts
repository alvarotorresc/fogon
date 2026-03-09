import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from '../supabase/supabase.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AVATAR_COLORS } from './constants';

@Injectable()
export class HouseholdService {
  private readonly supabase: SupabaseClient;
  private readonly logger = new Logger(HouseholdService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly notificationsService: NotificationsService,
  ) {
    this.supabase = this.supabaseService.getClient();
  }

  async create(userId: string, name: string) {
    const { data: household, error } = await this.supabase
      .from('households')
      .insert({ name, created_by: userId })
      .select()
      .single();

    if (error) throw new Error(error.message);

    const { error: memberError } = await this.supabase.from('household_members').insert({
      household_id: household.id,
      user_id: userId,
      display_name: name,
      avatar_color: AVATAR_COLORS[0],
      role: 'owner',
    });

    if (memberError) throw new Error(memberError.message);

    this.seedSampleRecipes(household.id as string, userId).catch((error) => {
      this.logger.warn('Failed to seed sample recipes', error);
    });

    return {
      id: household.id,
      name: household.name,
      inviteCode: household.invite_code,
      createdAt: household.created_at,
    };
  }

  async joinByInviteCode(userId: string, inviteCode: string, displayName: string) {
    const { data: household, error: findError } = await this.supabase
      .from('households')
      .select('id, name, invite_code, created_at')
      .eq('invite_code', inviteCode.toUpperCase())
      .single();

    if (findError || !household) {
      throw new NotFoundException('Invalid invite code');
    }

    const { data: existing } = await this.supabase
      .from('household_members')
      .select('id')
      .eq('household_id', household.id)
      .eq('user_id', userId)
      .single();

    if (existing) {
      throw new ConflictException('Already a member of this household');
    }

    const { count } = await this.supabase
      .from('household_members')
      .select('*', { count: 'exact', head: true })
      .eq('household_id', household.id);

    const avatarColor = AVATAR_COLORS[(count ?? 0) % AVATAR_COLORS.length];

    const { error: insertError } = await this.supabase.from('household_members').insert({
      household_id: household.id,
      user_id: userId,
      display_name: displayName,
      avatar_color: avatarColor,
      role: 'member',
    });

    if (insertError) throw new Error(insertError.message);

    this.notificationsService
      .sendToHousehold({
        householdId: household.id as string,
        title: 'Fogon',
        body: `${displayName} se ha unido al hogar`,
        excludeUserId: userId,
      })
      .catch((error) => {
        this.logger.warn('Failed to send join notification', error);
      });

    return {
      id: household.id,
      name: household.name,
      inviteCode: household.invite_code,
      createdAt: household.created_at,
    };
  }

  async leave(userId: string, householdId: string) {
    const { count, error: countError } = await this.supabase
      .from('household_members')
      .select('*', { count: 'exact', head: true })
      .eq('household_id', householdId);

    if (countError) throw new Error(countError.message);

    if (count === 1) {
      const { error: deleteError } = await this.supabase
        .from('households')
        .delete()
        .eq('id', householdId);

      if (deleteError) throw new Error(deleteError.message);

      return { deleted: true as const };
    }

    const { data: member } = await this.supabase
      .from('household_members')
      .select('role')
      .eq('household_id', householdId)
      .eq('user_id', userId)
      .single();

    if (member?.role === 'owner') {
      throw new ForbiddenException(
        'Owner cannot leave while other members exist. Transfer ownership first.',
      );
    }

    const { error: removeError } = await this.supabase
      .from('household_members')
      .delete()
      .eq('household_id', householdId)
      .eq('user_id', userId);

    if (removeError) throw new Error(removeError.message);

    return { deleted: false as const };
  }

  private async seedSampleRecipes(householdId: string, userId: string): Promise<void> {
    const sampleRecipes = [
      {
        title: 'Tortilla de patatas',
        description: 'La receta clasica espanola con cebolla caramelizada.',
        prepTimeMinutes: 35,
        ingredients: [
          { name: 'Patatas', quantity: '4', unit: 'unidades' },
          { name: 'Huevos', quantity: '6', unit: 'unidades' },
          { name: 'Cebolla', quantity: '1', unit: 'unidad' },
          { name: 'Aceite de oliva', quantity: '200', unit: 'ml' },
          { name: 'Sal', quantity: null, unit: null },
        ],
        steps: [
          'Pelar y cortar las patatas en rodajas finas. Cortar la cebolla en juliana.',
          'Freir las patatas y la cebolla a fuego medio en abundante aceite hasta que esten tiernas (15-20 min).',
          'Batir los huevos con sal en un bol grande. Escurrir las patatas y la cebolla y mezclar con el huevo.',
          'En una sarten con un poco de aceite, verter la mezcla y cocinar a fuego bajo 5 min.',
          'Dar la vuelta con un plato y cocinar otros 3-4 min. Servir templada.',
        ],
      },
      {
        title: 'Ensalada Cesar',
        description: 'Ensalada fresca con pollo a la plancha y aderezo cremoso.',
        prepTimeMinutes: 20,
        ingredients: [
          { name: 'Lechuga romana', quantity: '1', unit: 'unidad' },
          { name: 'Pechuga de pollo', quantity: '2', unit: 'unidades' },
          { name: 'Pan de molde', quantity: '2', unit: 'rebanadas' },
          { name: 'Parmesano rallado', quantity: '50', unit: 'g' },
          { name: 'Salsa cesar', quantity: '4', unit: 'cucharadas' },
        ],
        steps: [
          'Cortar el pan en cubos y tostar en sarten con aceite hasta que esten crujientes.',
          'Salpimentar las pechugas y cocinar a la plancha 6-7 min por cada lado.',
          'Lavar y trocear la lechuga. Colocar en un bol grande.',
          'Cortar el pollo en tiras y anadir sobre la lechuga junto con los crutones.',
          'Alisar con salsa cesar y parmesano rallado. Servir inmediatamente.',
        ],
      },
      {
        title: 'Pasta al pesto',
        description: 'Pasta rapida con salsa pesto casera de albahaca.',
        prepTimeMinutes: 15,
        ingredients: [
          { name: 'Pasta (espaguetis o penne)', quantity: '400', unit: 'g' },
          { name: 'Albahaca fresca', quantity: '1', unit: 'manojo' },
          { name: 'Pinones', quantity: '30', unit: 'g' },
          { name: 'Ajo', quantity: '1', unit: 'diente' },
          { name: 'Aceite de oliva virgen extra', quantity: '100', unit: 'ml' },
          { name: 'Parmesano rallado', quantity: '50', unit: 'g' },
        ],
        steps: [
          'Cocer la pasta en agua con sal segun las instrucciones del paquete.',
          'Mientras, triturar la albahaca, pinones, ajo, parmesano y aceite en batidora hasta obtener una salsa suave.',
          'Escurrir la pasta reservando un poco de agua de coccion.',
          'Mezclar la pasta con el pesto, anadiendo agua de coccion si queda muy espeso.',
          'Servir con un poco mas de parmesano rallado por encima.',
        ],
      },
      {
        title: 'Gazpacho',
        description: 'Sopa fria andaluza perfecta para los dias de calor.',
        prepTimeMinutes: 15,
        ingredients: [
          { name: 'Tomates maduros', quantity: '1', unit: 'kg' },
          { name: 'Pepino', quantity: '1', unit: 'unidad' },
          { name: 'Pimiento verde', quantity: '1', unit: 'unidad' },
          { name: 'Ajo', quantity: '1', unit: 'diente' },
          { name: 'Aceite de oliva virgen extra', quantity: '50', unit: 'ml' },
          { name: 'Vinagre de jerez', quantity: '2', unit: 'cucharadas' },
          { name: 'Sal', quantity: null, unit: null },
        ],
        steps: [
          'Lavar y trocear los tomates, el pepino y el pimiento.',
          'Poner todo en la batidora con el ajo, aceite, vinagre y sal.',
          'Triturar hasta obtener una textura fina y homogenea.',
          'Colar si se desea una textura mas suave.',
          'Refrigerar al menos 1 hora antes de servir bien frio.',
        ],
      },
      {
        title: 'Hummus',
        description: 'Crema de garbanzos suave y cremosa para dipear.',
        prepTimeMinutes: 10,
        ingredients: [
          { name: 'Garbanzos cocidos', quantity: '400', unit: 'g' },
          { name: 'Tahini', quantity: '3', unit: 'cucharadas' },
          { name: 'Limon', quantity: '1', unit: 'unidad' },
          { name: 'Ajo', quantity: '1', unit: 'diente' },
          { name: 'Aceite de oliva virgen extra', quantity: '3', unit: 'cucharadas' },
          { name: 'Comino', quantity: '1', unit: 'cucharadita' },
          { name: 'Sal', quantity: null, unit: null },
        ],
        steps: [
          'Escurrir y enjuagar los garbanzos.',
          'Triturar los garbanzos con tahini, zumo de limon, ajo, comino y sal.',
          'Anadir aceite de oliva y un poco de agua fria hasta conseguir la cremosidad deseada.',
          'Servir en un plato con un chorrito de aceite de oliva y pimenton por encima.',
        ],
      },
    ];

    for (const recipe of sampleRecipes) {
      const { data: created, error: recipeError } = await this.supabase
        .from('recipes')
        .insert({
          household_id: householdId,
          title: recipe.title,
          description: recipe.description,
          prep_time_minutes: recipe.prepTimeMinutes,
          is_public: false,
          created_by: userId,
        })
        .select('id')
        .single();

      if (recipeError || !created) {
        this.logger.warn(`Failed to seed recipe "${recipe.title}": ${recipeError?.message}`);
        continue;
      }

      const recipeId = created.id as string;

      if (recipe.ingredients.length > 0) {
        const { error: ingError } = await this.supabase.from('recipe_ingredients').insert(
          recipe.ingredients.map((ing, i) => ({
            recipe_id: recipeId,
            name: ing.name,
            quantity: ing.quantity,
            unit: ing.unit,
            position: i,
          })),
        );
        if (ingError) {
          this.logger.warn(`Failed to seed ingredients for "${recipe.title}": ${ingError.message}`);
        }
      }

      if (recipe.steps.length > 0) {
        const { error: stepError } = await this.supabase.from('recipe_steps').insert(
          recipe.steps.map((desc, i) => ({
            recipe_id: recipeId,
            step_number: i + 1,
            description: desc,
          })),
        );
        if (stepError) {
          this.logger.warn(`Failed to seed steps for "${recipe.title}": ${stepError.message}`);
        }
      }
    }

    this.logger.log(`Seeded ${sampleRecipes.length} sample recipes for household ${householdId}`);
  }

  async findMembers(householdId: string) {
    const { data, error } = await this.supabase
      .from('household_members')
      .select('*')
      .eq('household_id', householdId)
      .order('joined_at');

    if (error) throw new Error(error.message);

    return (data ?? []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      displayName: row.display_name,
      avatarColor: row.avatar_color,
      role: row.role,
      joinedAt: row.joined_at,
    }));
  }
}
