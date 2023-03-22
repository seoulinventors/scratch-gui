import {
    DARK_THEME,
    defaultColors,
    DEFAULT_THEME,
    getColorsForTheme,
    HIGH_CONTRAST_THEME
} from '../../../src/lib/themes';
import {injectExtensionBlockColors, injectExtensionCategoryColors} from '../../../src/lib/themes/blockHelpers';
import {detectTheme, persistTheme} from '../../../src/lib/themes/themePersistance';

jest.mock('../../../src/lib/themes/default-colors');
jest.mock('../../../src/lib/themes/dark-mode');

describe('themes', () => {
    let serializeToString;

    describe('core functionality', () => {
        test('provides the default theme colors', () => {
            expect(defaultColors.motion.primary).toEqual('#111111');
        });

        test('returns the dark mode', () => {
            const colors = getColorsForTheme(DARK_THEME);

            expect(colors.motion.primary).toEqual('#AAAAAA');
        });

        test('uses default theme colors when not specified', () => {
            const colors = getColorsForTheme(DARK_THEME);

            expect(colors.motion.secondary).toEqual('#222222');
        });
    });

    describe('block helpers', () => {
        beforeEach(() => {
            serializeToString = jest.fn(() => 'mocked xml');

            global.XMLSerializer = () => ({
                serializeToString
            });
        });

        test('updates extension blocks based on theme', () => {
            const blockInfoJson = {
                type: 'dummy_block',
                colour: '#0FBD8C',
                colourSecondary: '#0DA57A',
                colourTertiary: '#0B8E69'
            };

            const updated = injectExtensionBlockColors(blockInfoJson, DARK_THEME);

            expect(updated).toEqual({
                type: 'dummy_block',
                colour: '#FFFFFF',
                colourSecondary: '#EEEEEE',
                colourTertiary: '#DDDDDD'
            });
            // The original value was not modified
            expect(blockInfoJson.colour).toBe('#0FBD8C');
        });

        test('bypasses updates if using the default theme', () => {
            const blockInfoJson = {
                type: 'dummy_block',
                colour: '#0FBD8C',
                colourSecondary: '#0DA57A',
                colourTertiary: '#0B8E69'
            };

            const updated = injectExtensionBlockColors(blockInfoJson, DEFAULT_THEME);

            expect(updated).toEqual({
                type: 'dummy_block',
                colour: '#0FBD8C',
                colourSecondary: '#0DA57A',
                colourTertiary: '#0B8E69'
            });
        });

        test('updates extension category based on theme', () => {
            const dynamicBlockXML = [
                {
                    id: 'pen',
                    xml: '<category name="Pen" id="pen" colour="#0FBD8C" secondaryColour="#0DA57A"></category>'
                }
            ];

            injectExtensionCategoryColors(dynamicBlockXML, DARK_THEME);

            // XMLSerializer is not available outside the browser.
            // Verify the mocked XMLSerializer.serializeToString is called with updated colors.
            expect(serializeToString.mock.calls[0][0].documentElement.getAttribute('colour')).toBe('#FFFFFF');
            expect(serializeToString.mock.calls[0][0].documentElement.getAttribute('secondaryColour')).toBe('#DDDDDD');
        });
    });

    describe('theme persistance', () => {
        test('returns the theme stored in a cookie', () => {
            window.document.cookie = `scratchtheme=${HIGH_CONTRAST_THEME}`;

            const theme = detectTheme();

            expect(theme).toEqual(HIGH_CONTRAST_THEME);
        });

        test('returns the system theme when no cookie', () => {
            window.document.cookie = 'scratchtheme=';

            const theme = detectTheme();

            expect(theme).toEqual(DEFAULT_THEME);
        });

        test('persists theme to cookie', () => {
            window.document.cookie = 'scratchtheme=';

            persistTheme(HIGH_CONTRAST_THEME);

            expect(window.document.cookie).toEqual(`scratchtheme=${HIGH_CONTRAST_THEME}`);
        });

        test('clears theme when matching system preferences', () => {
            window.document.cookie = `scratchtheme=${HIGH_CONTRAST_THEME}`;

            persistTheme(DEFAULT_THEME);

            expect(window.document.cookie).toEqual('scratchtheme=');
        });
    });
});