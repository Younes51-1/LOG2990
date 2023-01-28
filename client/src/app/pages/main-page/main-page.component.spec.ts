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

    it("should have as title 'Jeu des différences'", () => {
        expect(component.title).toEqual('Jeu des différences');
    });

    it("should have team name '204 : NO CONTENT'", () => {
        expect(component.teamName).toEqual('204 : NO CONTENT');
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
        expect(image.src).toContain('/assets/logo.png');
    });

    it('should have configuration button', () => {
        const configSections = fixture.debugElement.nativeElement.getElementsByClassName('header-section')[0];
        const configBtn = configSections.getElementsByTagName('button')[0];
        expect(configBtn).not.toBeUndefined();
    });

    it('should have three game mode', () => {
        const gameModeSections = fixture.debugElement.nativeElement.getElementsByClassName('card')[0];
        expect(gameModeSections.childElementCount).toEqual(3);
    });

    it('should have cheat mode button', () => {
        const cheatSection = fixture.debugElement.nativeElement.getElementsByClassName('cheat button')[0];
        const limitedBtn = cheatSection.getElementsByTagName('button')[0];
        expect(limitedBtn).not.toBeUndefined();
        expect(limitedBtn.innerHTML).toEqual('CHEAT');
    });

    it('should have clasique mode button', () => {
        const classicSection = fixture.debugElement.nativeElement.getElementsByClassName('solo button')[0];
        const classiqueBtn = classicSection.getElementsByTagName('button')[0];
        expect(classiqueBtn).not.toBeUndefined();
        expect(classiqueBtn.innerHTML).toEqual('CLASSIC');
    });

    it('should have limited mode button', () => {
        const chronoSection = fixture.debugElement.nativeElement.getElementsByClassName('chrono button')[0];
        const limitedBtn = chronoSection.getElementsByTagName('button')[0];
        expect(limitedBtn).not.toBeUndefined();
        expect(limitedBtn.innerHTML).toEqual('CHRONO');
    });
});
