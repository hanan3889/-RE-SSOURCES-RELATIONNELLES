import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { RessourceListComponent } from './ressource-list.component';
import { RessourceService, Ressource } from '../../services/ressource.service';

const mockRessources: Ressource[] = [
  {
    id: 1,
    title: 'Guide communication couple',
    description: 'Apprendre a communiquer',
    content: 'Contenu',
    author: 'Alice Dupont',
    category: 'Couple',
    createdAt: new Date('2026-01-01'),
    type: 'article',
    visibilite: 'Publique',
    statut: 'Publi\u00e9e',
  },
  {
    id: 2,
    title: 'Gestion conflits familiaux',
    description: 'Resoudre les conflits',
    content: 'Contenu 2',
    author: 'Bob Martin',
    category: 'Famille',
    createdAt: new Date('2026-02-01'),
    type: 'article',
    visibilite: 'Publique',
    statut: 'Publi\u00e9e',
  },
];

describe('RessourceListComponent', () => {
  let component: RessourceListComponent;
  let fixture: ComponentFixture<RessourceListComponent>;
  let ressourceServiceSpy: jasmine.SpyObj<RessourceService>;

  beforeEach(async () => {
    ressourceServiceSpy = jasmine.createSpyObj('RessourceService', ['getRessources']);
    ressourceServiceSpy.getRessources.and.returnValue(of(mockRessources));

    await TestBed.configureTestingModule({
      imports: [RessourceListComponent, RouterTestingModule],
      providers: [
        { provide: RessourceService, useValue: ressourceServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RessourceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // CT-RES-001 — Lister les ressources publiques
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('devrait appeler getRessources au demarrage', () => {
    expect(ressourceServiceSpy.getRessources).toHaveBeenCalled();
  });

  it('filteredRessources$ devrait emettre les ressources chargees', (done) => {
    component.filteredRessources$.subscribe((ressources) => {
      expect(ressources.length).toBe(2);
      done();
    });
  });

  it('devrait avoir la date courante comme currentYear', () => {
    expect(component.currentYear).toBe(new Date().getFullYear());
  });
});
