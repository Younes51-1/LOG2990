import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('MainPageComponent', () => {
    let component: MainPageComponent;
    let fixture: ComponentFixture<MainPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MainPageComponent],
            imports: [RouterTestingModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MainPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it("should have as title 'jeu des différences !'", () => {
        expect(component.title).toEqual('jeu des différences !');
    });

    it("should have team name '204'", () => {
        expect(component.teamName).toEqual('204');
    });

    it("should have team members full name '", () => {
        const teamMembersFullName: string[] = [
            'Coralie Brodeur',
            ' Imène Clara Ghazi',
            ' Kylian Chaussoy',
            ' Thibault Demagny',
            ' Younes Benabbou',
            ' Dumitru Zlotea',
        ];

        expect(component.teamMembers).toEqual(teamMembersFullName);
    });

    it('should have game logo', () => {
        const image = fixture.debugElement.nativeElement.querySelector('img');
        expect(image.src).toContain('/assets/logo.jpg');
    });

    it('should have configuration button', () => {
        const configSections = fixture.debugElement.nativeElement.getElementsByClassName('header-section')[0];
        const configBtn = configSections.getElementsByTagName('button')[0];
        expect(configBtn).not.toBeUndefined();
    });

    it('should have clasique mode button', () => {
        const selectSections = fixture.debugElement.nativeElement.getElementsByClassName('section')[0];
        const classiqueBtn = selectSections.getElementsByTagName('button')[0];
        expect(classiqueBtn).not.toBeUndefined();
        expect(classiqueBtn.innerHTML).toEqual('Classique');
    });

    it('should have limited mode button', () => {
        const selectSections = fixture.debugElement.nativeElement.getElementsByClassName('section')[0];
        const limitedBtn = selectSections.getElementsByTagName('button')[1];
        expect(limitedBtn).not.toBeUndefined();
        expect(limitedBtn.innerHTML).toEqual('Temps Limité');
    });
});
