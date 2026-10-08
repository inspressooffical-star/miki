import 'package:flutter/material.dart';
import 'package:table_calendar/table_calendar.dart';

class FortuneDetailScreen extends StatefulWidget {
  const FortuneDetailScreen({Key? key}) : super(key: key);

  @override
  State<FortuneDetailScreen> createState() => _FortuneDetailScreenState();
}

class _FortuneDetailScreenState extends State<FortuneDetailScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  DateTime _focusedDay = DateTime.now();
  DateTime? _selectedDay;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('운세 상세보기'),
        centerTitle: true,
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: '일별'),
            Tab(text: '월별'),
            Tab(text: '연별'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildDailyTab(),
          _buildMonthlyTab(),
          _buildYearlyTab(),
        ],
      ),
    );
  }

  Widget _buildDailyTab() {
    return SingleChildScrollView(
      child: Column(
        children: [
          TableCalendar(
            focusedDay: _focusedDay,
            firstDay: DateTime(2024),
            lastDay: DateTime(2025),
            selectedDayPredicate: (day) {
              return isSameDay(_selectedDay, day);
            },
            onDaySelected: (selectedDay, focusedDay) {
              setState(() {
                _selectedDay = selectedDay;
                _focusedDay = focusedDay;
              });
            },
          ),
          if (_selectedDay != null) _buildDailyFortuneCard(),
        ],
      ),
    );
  }

  Widget _buildDailyFortuneCard() {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Card(
        elevation: 2,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                '${_selectedDay?.year}년 ${_selectedDay?.month}월 ${_selectedDay?.day}일',
                style: Theme.of(context)
                    .textTheme
                    .titleLarge
                    ?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              _buildLuckBar('전체운', 7),
              _buildLuckBar('건강운', 8),
              _buildLuckBar('연애운', 6),
              _buildLuckBar('재물운', 7),
              _buildLuckBar('사업운', 8),
              const SizedBox(height: 16),
              Text(
                '오늘은 전반적으로 긍정적인 에너지의 날입니다. 새로운 일을 시작하기 좋은 날이며, 대인관계도 원만할 것으로 보입니다.',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMonthlyTab() {
    return ListView(
      padding: const EdgeInsets.all(16.0),
      children: [
        _buildTimeFrameCard(
          '2024년 1월',
          'new_year',
          '새해의 시작으로 전반적인 흐름이 좋습니다. 새로운 계획을 세우고 실행하기 좋은 시기입니다.',
        ),
      ],
    );
  }

  Widget _buildYearlyTab() {
    return ListView(
      padding: const EdgeInsets.all(16.0),
      children: [
        _buildTimeFrameCard(
          '2024년',
          'full_year',
          '올해는 변화와 성장의 해입니다. 도전정신을 발휘하면 좋은 결과를 얻을 수 있습니다.',
        ),
      ],
    );
  }

  Widget _buildTimeFrameCard(String title, String tag, String description) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              title,
              style: Theme.of(context)
                  .textTheme
                  .titleLarge
                  ?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            _buildLuckBar('전체운', 6),
            _buildLuckBar('건강운', 7),
            _buildLuckBar('연애운', 5),
            _buildLuckBar('재물운', 8),
            _buildLuckBar('사업운', 7),
            const SizedBox(height: 16),
            Text(
              description,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLuckBar(String label, int value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                label,
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              Text(
                '$value/10',
                style: Theme.of(context)
                    .textTheme
                    .bodyMedium
                    ?.copyWith(fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const SizedBox(height: 4),
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: LinearProgressIndicator(
              value: value / 10,
              minHeight: 8,
              backgroundColor: Colors.grey.withOpacity(0.2),
              valueColor: AlwaysStoppedAnimation<Color>(
                _getLuckColor(value),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Color _getLuckColor(int value) {
    if (value >= 8) return Colors.green;
    if (value >= 6) return Colors.orange;
    return Colors.red;
  }
}
