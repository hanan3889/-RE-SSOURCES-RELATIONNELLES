import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../features/auth/pages/login_page.dart';
import '../features/auth/pages/register_page.dart';
import '../features/auth/pages/profile_page.dart';
import '../features/auth/providers/auth_provider.dart';
import '../features/home/pages/home_page.dart';
import '../features/resources/pages/ressource_list_page.dart';
import '../features/resources/pages/ressource_detail_page.dart';
import '../features/resources/pages/create_ressource_page.dart';
import '../features/mon_espace/pages/mon_espace_page.dart';
import '../features/moderation/pages/moderation_page.dart';
import '../features/admin/pages/admin_page.dart';
import '../shared/widgets/app_scaffold.dart';

// Cles de navigation pour chaque branche
final _rootNavigatorKey = GlobalKey<NavigatorState>();
final _homeNavigatorKey = GlobalKey<NavigatorState>(debugLabel: 'home');
final _ressourcesNavigatorKey =
    GlobalKey<NavigatorState>(debugLabel: 'ressources');
final _monEspaceNavigatorKey =
    GlobalKey<NavigatorState>(debugLabel: 'monEspace');
final _profilNavigatorKey = GlobalKey<NavigatorState>(debugLabel: 'profil');

final routerProvider = Provider<GoRouter>((ref) {
  final auth = ref.watch(authProvider);

  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/home',
    debugLogDiagnostics: true,
    redirect: (context, state) {
      final loggedIn = auth.isAuthenticated;
      final isAuthRoute = state.matchedLocation == '/login' ||
          state.matchedLocation == '/register';

      // Si deja connecte et sur une page auth, renvoyer a l accueil
      if (loggedIn && isAuthRoute) return '/home';

      return null;
    },
    routes: [
      // ── Pages plein ecran (hors scaffold) ──
      GoRoute(
        path: '/login',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const LoginPage(),
      ),
      GoRoute(
        path: '/register',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const RegisterPage(),
      ),

      // ── Scaffold principal avec navigation par onglets ──
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) {
          return AppScaffold(navigationShell: navigationShell);
        },
        branches: [
          // Branche 0 : Accueil
          StatefulShellBranch(
            navigatorKey: _homeNavigatorKey,
            routes: [
              GoRoute(
                path: '/home',
                builder: (context, state) => const HomePage(),
              ),
            ],
          ),

          // Branche 1 : Ressources
          StatefulShellBranch(
            navigatorKey: _ressourcesNavigatorKey,
            routes: [
              GoRoute(
                path: '/ressources',
                builder: (context, state) => RessourceListPage(
                  initialCategorie: state.uri.queryParameters['categorie'],
                ),
                routes: [
                  GoRoute(
                    path: 'create',
                    parentNavigatorKey: _rootNavigatorKey,
                    builder: (context, state) =>
                        const CreateRessourcePage(),
                  ),
                  GoRoute(
                    path: ':id',
                    parentNavigatorKey: _rootNavigatorKey,
                    builder: (context, state) {
                      final id =
                          int.parse(state.pathParameters['id'] ?? '0');
                      return RessourceDetailPage(ressourceId: id);
                    },
                  ),
                ],
              ),
            ],
          ),

          // Branche 2 : Mon Espace
          StatefulShellBranch(
            navigatorKey: _monEspaceNavigatorKey,
            routes: [
              GoRoute(
                path: '/mon-espace',
                builder: (context, state) {
                  if (!auth.isAuthenticated) {
                    return const _AuthRequiredPage();
                  }
                  return const MonEspacePage();
                },
              ),
            ],
          ),

          // Branche 3 : Profil
          StatefulShellBranch(
            navigatorKey: _profilNavigatorKey,
            routes: [
              GoRoute(
                path: '/profil',
                builder: (context, state) {
                  if (!auth.isAuthenticated) {
                    return const _AuthRequiredPage();
                  }
                  return const ProfilePage();
                },
              ),
            ],
          ),
        ],
      ),

      // ── Pages plein ecran protegees ──
      GoRoute(
        path: '/moderation',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const ModerationPage(),
      ),
      GoRoute(
        path: '/admin',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const AdminPage(),
      ),
    ],
  );
});

/// Page affichee quand l utilisateur doit se connecter.
class _AuthRequiredPage extends StatelessWidget {
  const _AuthRequiredPage();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                Icons.lock_outline,
                size: 64,
                color: Theme.of(context).colorScheme.primary,
              ),
              const SizedBox(height: 20),
              const Text(
                'Connexion requise',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Connectez-vous pour acceder a cette fonctionnalite.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 14, color: Colors.grey),
              ),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: () => context.push('/login'),
                icon: const Icon(Icons.login),
                label: const Text('Se connecter'),
              ),
              const SizedBox(height: 12),
              TextButton(
                onPressed: () => context.push('/register'),
                child: const Text('Creer un compte'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
