exports.seed = knex =>
    knex('CONDITIONS').delete()
        .then(
            () => knex('CONDITIONS').insert([
                {
                    TYPE: "STANDARD",
                    TEXT: "Be of good behaviour and not behave in a way which undermines the purpose of the licence period"
                },
                {
                    TYPE: "STANDARD",
                    TEXT: "Not commit any offence"
                },
                {
                    TYPE: "STANDARD",
                    TEXT: "Keep in touch with the supervising officer in accordance with instructions given by the supervising officer"
                },
                {
                    TYPE: "STANDARD",
                    TEXT: "Receive visits from the supervising officer in accordance with instructions given by the supervising officer"
                },
                {
                    TYPE: "STANDARD",
                    TEXT: "Reside permanently at an address approved by the supervising officer and obtain the prior permission of the supervising officer for any stay of one or more nights at a different address"
                },
                {
                    TYPE: "STANDARD",
                    TEXT: "Not undertake work, or a particular type of work, unless it is approved by the supervising officer and notify the supervising officer in advance of any proposal to undertake work or a particular type of work"
                },
                {
                    TYPE: "STANDARD",
                    TEXT: "Not travel outside the United Kingdom, the Channel Islands or the Isle of Man except with the prior permission of your supervising officer or for the purposes of immigration deportation or removal"
                }
            ])
        );


