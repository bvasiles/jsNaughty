describe("Save new URL", function() {

    beforeEach(function () {
        settings = new TempSettings();
        save_new_url();
    });
    
    it("Extracts and saves well-formed URLs", function() {
        expect(settings.timesink_urls['www.zombo.com']).toEqual(900);
    });

    it("Ignores empty URLs", function() {
        document.getElementById("url-field").value = '';
        save_new_url();
        expect(settings.timesink_urls['']).toBeUndefined();
    });

    it("Ignores times that are NaN", function() {
        document.getElementById("url-field").value = 'searchwithpeter.info';
        document.getElementById("time-field").value = 'HAY GUIZE!';        
        save_new_url();
        expect(settings.timesink_urls['searchwithpeter.info']).toBeUndefined();
    });

    it("Ignores times that are less than zero", function() {
        document.getElementById("url-field").value = 'searchwithpeter.info';
        document.getElementById("time-field").value = '-5';        
        save_new_url();
        expect(settings.timesink_urls['searchwithpeter.info']).toBeUndefined();
    });

    it("Creates and inserts new list item to display URL", function() {
        expect(document.getElementById('www.zombo.com')).toBeDefined();
    });

    
});

