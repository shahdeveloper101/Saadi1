document.addEventListener("DOMContentLoaded", function () {

    const searchInput = document.getElementById("searchInput");

    if (!searchInput) return;


    let highlightedElements = [];


    /* =========================================
       REMOVE OLD HIGHLIGHTS
    ========================================= */

    function clearHighlights() {

        highlightedElements.forEach(function (mark) {

            const parent = mark.parentNode;

            if (!parent) return;

            parent.replaceChild(
                document.createTextNode(mark.textContent),
                mark
            );

            parent.normalize();

        });

        highlightedElements = [];
    }


    /* =========================================
       CREATE SEARCH REGEX
    ========================================= */

    function createRegex(value) {

        const escaped = value.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );

        return new RegExp(escaped, "gi");
    }


    /* =========================================
       SEARCH PAGE TEXT
    ========================================= */

    function searchPage(value) {

        clearHighlights();


        if (!value) {
            return;
        }


        const regex = createRegex(value);


        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function (node) {

                    const parent = node.parentElement;

                    if (!parent) {
                        return NodeFilter.FILTER_REJECT;
                    }


                    /*
                       In elements ko search nahi karna
                    */

                    const ignoredTags = [
                        "SCRIPT",
                        "STYLE",
                        "NOSCRIPT",
                        "INPUT",
                        "TEXTAREA",
                        "SELECT",
                        "OPTION",
                        "BUTTON"
                    ];


                    if (
                        ignoredTags.includes(
                            parent.tagName
                        )
                    ) {
                        return NodeFilter.FILTER_REJECT;
                    }


                    /*
                       Empty text ignore
                    */

                    if (
                        !node.nodeValue.trim()
                    ) {
                        return NodeFilter.FILTER_REJECT;
                    }


                    /*
                       Already highlighted text ignore
                    */

                    if (
                        parent.closest(
                            ".search-highlight"
                        )
                    ) {
                        return NodeFilter.FILTER_REJECT;
                    }


                    return NodeFilter.FILTER_ACCEPT;

                }
            }
        );


        const textNodes = [];


        while (walker.nextNode()) {

            textNodes.push(
                walker.currentNode
            );

        }


        /* =========================================
           HIGHLIGHT MATCHES
        ========================================= */

        textNodes.forEach(function (node) {

            const text = node.nodeValue;

            regex.lastIndex = 0;


            if (!regex.test(text)) {
                return;
            }


            regex.lastIndex = 0;


            const fragment =
                document.createDocumentFragment();


            let lastIndex = 0;


            text.replace(
                regex,
                function (match, offset) {

                    /*
                       Before match
                    */

                    fragment.appendChild(
                        document.createTextNode(
                            text.substring(
                                lastIndex,
                                offset
                            )
                        )
                    );


                    /*
                       Highlight
                    */

                    const mark =
                        document.createElement("mark");


                    mark.className =
                        "search-highlight";


                    mark.textContent =
                        match;


                    fragment.appendChild(mark);


                    highlightedElements.push(
                        mark
                    );


                    lastIndex =
                        offset + match.length;

                }
            );


            /*
               After match
            */

            fragment.appendChild(
                document.createTextNode(
                    text.substring(lastIndex)
                )
            );


            node.parentNode.replaceChild(
                fragment,
                node
            );

        });


        /* =========================================
           SCROLL TO FIRST RESULT
        ========================================= */

        if (highlightedElements.length > 0) {

            highlightedElements[0].scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

        }

    }


    /* =========================================
       SEARCH INPUT
    ========================================= */

    searchInput.addEventListener(
        "input",
        function () {

            searchPage(
                this.value.trim()
            );

        }
    );


    /* =========================================
       CLEAR SEARCH WITH ESC
    ========================================= */

    searchInput.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Escape") {

                this.value = "";

                clearHighlights();

                this.focus();

            }

        }
    );


});