import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_endpoints.dart';

// ─── Modèles pour le profil ───

class MesCommentaire {
  final int idCommentaire;
  final int idRessource;
  final String titreRessource;
  final String contenu;
  final DateTime dateCreation;

  const MesCommentaire({
    required this.idCommentaire,
    required this.idRessource,
    required this.titreRessource,
    required this.contenu,
    required this.dateCreation,
  });

  factory MesCommentaire.fromJson(Map<String, dynamic> json) => MesCommentaire(
        idCommentaire: json['idCommentaire'] as int,
        idRessource: json['idRessource'] as int? ?? 0,
        titreRessource: json['titreRessource'] as String? ?? '',
        contenu: json['contenu'] as String? ?? '',
        dateCreation:
            DateTime.tryParse(json['dateCreation'] ?? '') ?? DateTime.now(),
      );
}

class InboxMessage {
  final int idMessage;
  final String contenu;
  final DateTime dateCreation;
  final String typeMessage;
  final String? statutInvitation;
  final int? idRessource;
  final String? titreRessource;
  final int idAuteur;
  final String nomAuteur;
  final String prenomAuteur;
  final int? idDestinataire;
  final String? nomDestinataire;
  final String? prenomDestinataire;

  const InboxMessage({
    required this.idMessage,
    required this.contenu,
    required this.dateCreation,
    required this.typeMessage,
    this.statutInvitation,
    this.idRessource,
    this.titreRessource,
    required this.idAuteur,
    required this.nomAuteur,
    required this.prenomAuteur,
    this.idDestinataire,
    this.nomDestinataire,
    this.prenomDestinataire,
  });

  factory InboxMessage.fromJson(Map<String, dynamic> json) => InboxMessage(
        idMessage: json['idMessage'] as int,
        contenu: json['contenu'] as String? ?? '',
        dateCreation:
            DateTime.tryParse(json['dateCreation'] ?? '') ?? DateTime.now(),
        typeMessage: json['typeMessage'] as String? ?? '',
        statutInvitation: json['statutInvitation'] as String?,
        idRessource: json['idRessource'] as int?,
        titreRessource: json['titreRessource'] as String?,
        idAuteur: json['idAuteur'] as int? ?? 0,
        nomAuteur: json['nomAuteur'] as String? ?? '',
        prenomAuteur: json['prenomAuteur'] as String? ?? '',
        idDestinataire: json['idDestinataire'] as int?,
        nomDestinataire: json['nomDestinataire'] as String?,
        prenomDestinataire: json['prenomDestinataire'] as String?,
      );

  String get auteurFullName => '$prenomAuteur $nomAuteur'.trim();
  bool get isInvitation =>
      typeMessage == 'invitation' && statutInvitation == 'pending';
}

class UserProfile {
  final int idUtilisateur;
  final String email;
  final String nom;
  final String prenom;
  final String role;
  final bool isActive;
  final DateTime createdAt;

  const UserProfile({
    required this.idUtilisateur,
    required this.email,
    required this.nom,
    required this.prenom,
    required this.role,
    required this.isActive,
    required this.createdAt,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) => UserProfile(
        idUtilisateur: json['idUtilisateur'] as int,
        email: json['email'] as String? ?? '',
        nom: json['nom'] as String? ?? '',
        prenom: json['prenom'] as String? ?? '',
        role: json['nomRole'] as String? ?? 'citoyen',
        isActive: json['isActive'] as bool? ?? true,
        createdAt:
            DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
      );

  String get fullName => '$prenom $nom'.trim();
}

// ─── Providers ───

/// Profil utilisateur détaillé via /users/{id}.
final userProfileProvider =
    FutureProvider.family<UserProfile, int>((ref, userId) async {
  final dio = ref.read(apiClientProvider);
  final response = await dio.get(ApiEndpoints.userById(userId));
  return UserProfile.fromJson(response.data as Map<String, dynamic>);
});

/// Commentaires de l'utilisateur connecté.
final mesCommentairesProvider =
    FutureProvider<List<MesCommentaire>>((ref) async {
  final dio = ref.read(apiClientProvider);
  final response = await dio.get(ApiEndpoints.mesCommentaires);
  return (response.data as List)
      .map((e) => MesCommentaire.fromJson(e as Map<String, dynamic>))
      .toList();
});

/// Messages reçus (inbox) de l'utilisateur connecté.
final inboxProvider = FutureProvider<List<InboxMessage>>((ref) async {
  final dio = ref.read(apiClientProvider);
  final response = await dio.get(ApiEndpoints.messagesInbox);
  return (response.data as List)
      .map((e) => InboxMessage.fromJson(e as Map<String, dynamic>))
      .toList();
});

/// Invitations en attente filtrées depuis l'inbox.
final pendingInvitationsProvider =
    FutureProvider<List<InboxMessage>>((ref) async {
  final inbox = await ref.watch(inboxProvider.future);
  return inbox.where((m) => m.isInvitation).toList();
});

// ─── Actions sur le profil ───

class ProfileActions {
  final Dio _dio;
  ProfileActions(this._dio);

  /// Répondre à une invitation (accepter/refuser).
  Future<InboxMessage> respondToInvitation(
      int messageId, bool acceptee) async {
    final response = await _dio.put(
      ApiEndpoints.invitationStatus(messageId),
      data: {'acceptee': acceptee},
    );
    return InboxMessage.fromJson(response.data as Map<String, dynamic>);
  }

  /// Supprimer un commentaire.
  Future<void> deleteComment(int commentId) async {
    await _dio.delete('/commentaires/$commentId');
  }

  /// Mettre à jour les informations du profil.
  Future<UserProfile> updateProfile(
      int userId, {String? nom, String? prenom}) async {
    final data = <String, dynamic>{};
    if (nom != null) data['nom'] = nom;
    if (prenom != null) data['prenom'] = prenom;
    final response = await _dio.put(
      ApiEndpoints.userById(userId),
      data: data,
    );
    return UserProfile.fromJson(response.data as Map<String, dynamic>);
  }

  /// Changer le mot de passe.
  Future<void> changePassword(int userId, String newPassword) async {
    await _dio.post(
      ApiEndpoints.userResetPassword(userId),
      data: {'newPassword': newPassword},
    );
  }

  /// Supprimer le compte.
  Future<void> deleteAccount(int userId) async {
    await _dio.delete(ApiEndpoints.userById(userId));
  }
}

final profileActionsProvider = Provider<ProfileActions>((ref) {
  return ProfileActions(ref.read(apiClientProvider));
});
