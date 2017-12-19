let app = {
    recommendationPage: "#recommend-results",
    searchPage: "#search-results",
    input: null,
    baseURL: "https://api.themoviedb.org/3/",
    configData: null,
    baseImageURL: null,

    init: function() {
        app.input = document.getElementById("search-input");
        app.input.focus();
        setTimeout(app.addHandlers, 1000);
    },
    addHandlers: function() {
        let btn = document.getElementById("search-button");
        btn.addEventListener("click", app.getConfig);

        // listener for ENTER keypress
        document.addEventListener("keypress", function(ev) {
            let char = ev.char || ev.charCode || ev.which;
            if (char == 10 || char == 13) {
                // either ENTER or RETURN keypress
                btn.dispatchEvent(new MouseEvent("click"));
            }
        })
    },
    getConfig: function(ev) {
        let url = `${app.baseURL}configuration?api_key=${APIKEY}`;
        fetch(url)
            .then((result) => {
                return result.json();
            })
            .then((data) => {
                app.baseImageURL = data.images.secure_base_url;
                app.configData = data.images;

                return app.runSearch();
            })
            .catch(err => {
                console.log("Something went wrong:", err);
            })

    },
    runSearch: function(ev) {
        //
        if (app.input.value) {
            let url = `${app.baseURL}search/movie?api_key=${APIKEY}&query=${app.input.value}`;

            fetch(url)
                .then(response => response.json())
                .then(data => {
                    app.displayMovies(data.results, app.searchPage);
                })

                .catch(err => {
                    console.log(err);
                });
        }
    },

    displayMovies: function(movies, pageToAnimate, headerText) {
        // scrolls back to top of the page
        window.scrollTo(0, 0);

        headerText = headerText || "Movies";

        let page = document.querySelector(`${pageToAnimate}`);
        page.classList.toggle("fadeInUp");
        let section = document.querySelector(`${pageToAnimate} .content`);
        let about = document.querySelector("#about");
        let df = document.createDocumentFragment();
        let header = document.getElementById("headerText");
        header.textContent = headerText;

        section.innerHTML = "";

        if (about) about.remove();
        movies.forEach((movie) => {
            let date = new Date(movie.release_date).toLocaleDateString("en-US");
            let card = document.createElement("div");
            let cardBody = document.createElement("div");
            let img = document.createElement("img");


            let cardTitle = document.createElement("h4");
            let cardSubtitle = document.createElement("h6");
            let cardContent = document.createElement("p");

            card.classList.add("card", "col-5", "movie", "mx-auto");
            card.setAttribute("data-movie", movie.id);
            card.addEventListener("click", app.getRecommend);

            cardBody.className = "card-body";

            img.classList.add("card-img-top", "medium", "mx-auto");
            img.src = `${app.baseImageURL}w185${movie.poster_path}`;
            img.alt = `poster for the movie ${movie.title}`;

            cardTitle.className = "card-title";
            cardSubtitle.classList.add("card-subtitle", "mb-2", "text-muted");
            cardContent.className = "card-text";

            cardTitle.textContent = movie.title;
            cardSubtitle.textContent = date;
            cardContent.textContent = movie.overview;

            card.appendChild(img);
            card.appendChild(cardTitle);
            card.appendChild(cardSubtitle);
            card.appendChild(cardContent);
            df.appendChild(card);
        });
        section.appendChild(df);
    },
    getRecommend: function(recommend) {
        let movie_id = recommend.currentTarget.getAttribute("data-movie");
        let url = `${app.baseURL}movie/${movie_id}/recommendations?api_key=${APIKEY}`;

        fetch(url)
            .then(response => response.json())
            .then((data) => {
                if (data.results == 0) {
                    alert("There are no recommendations for this title! Sorry about that!");
                } else {
                    let sr = document.querySelector("#search-results .content");
                    sr.innerHTML = "";

                    app.displayMovies(data.results, app.recommendationPage, "Recommendations");
                }
            })
            .catch(err =>
                console.log(err))
    },
};

document.addEventListener("DOMContentLoaded", app.init);
